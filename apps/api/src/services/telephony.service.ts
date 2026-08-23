import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GhostLeadService } from './ghost-lead.service';
import { SmsService } from './sms.service';

export class TelephonyService {
  private supabase: SupabaseClient;
  private ghostLeadService: GhostLeadService;
  private smsService: SmsService;

  constructor(supabaseUrl: string, supabaseKey: string, telnyxKey?: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.smsService = new SmsService(telnyxKey);
    this.ghostLeadService = new GhostLeadService(this.supabase, this.smsService);
  }

  /**
   * Translates a Telnyx tracking number to the corresponding Tenant ID
   */
  async getTenantByTrackingNumber(phoneNumber: string): Promise<string | null> {
    const { data } = await this.supabase
      .from('phone_numbers')
      .select('tenant_id')
      .eq('number', phoneNumber)
      .single();
    
    return data?.tenant_id || null;
  }

  /**
   * Looks up an existing contact or creates a new "unknown" contact for inbound calls.
   */
  async findOrCreateContact(tenantId: string, fromNumber: string, source: string = 'call') {
    const { data: existing } = await this.supabase
      .from('contacts')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('phone', fromNumber)
      .single();

    if (existing) return existing;

    const { data: newContact, error } = await this.supabase
      .from('contacts')
      .insert([{
        tenant_id: tenantId,
        first_name: 'Unknown',
        last_name: 'Caller',
        phone: fromNumber,
        source
      }])
      .select()
      .single();

    if (error) throw error;
    return newContact;
  }

  async handleCallInitiated(payload: any) {
    const tenantId = await this.getTenantByTrackingNumber(payload.to);
    if (!tenantId) {
      console.warn(`[Telephony] No tenant found for tracking number ${payload.to}`);
      return;
    }

    const contact = await this.findOrCreateContact(tenantId, payload.from, 'call');

    // Create interaction record
    await this.supabase.from('interactions').insert([{
      tenant_id: tenantId,
      contact_id: contact.id,
      type: 'call',
      metadata: {
        call_control_id: payload.call_control_id,
        direction: payload.direction,
        state: 'initiated'
      }
    }]);
  }

  async handleCallHangup(payload: any) {
    const tenantId = await this.getTenantByTrackingNumber(payload.to);
    if (!tenantId) return;

    // Find the associated interaction to update
    const { data: interactions } = await this.supabase
      .from('interactions')
      .select('id, metadata')
      .eq('tenant_id', tenantId)
      .eq('type', 'call')
      .order('created_at', { ascending: false })
      .limit(50);

    const activeInteraction = interactions?.find((i: any) => i.metadata?.call_control_id === payload.call_control_id);

    if (activeInteraction) {
      await this.supabase.from('interactions').update({
        metadata: {
          ...activeInteraction.metadata,
          state: 'completed',
          hangup_cause: payload.hangup_cause,
          summary: `Call ended (${payload.hangup_cause})`
        }
      }).eq('id', activeInteraction.id);
    }

    // Ghost Lead Engine trigger
    const abandonedCauses = ['abandoned', 'no_answer', 'busy', 'originator_cancel'];
    if (abandonedCauses.includes(payload.hangup_cause)) {
      await this.ghostLeadService.processAbandonedCall(tenantId, payload);
    }
  }

  async handleSmsReceived(payload: any) {
    const tenantId = await this.getTenantByTrackingNumber(payload.to[0].phone_number);
    if (!tenantId) return;

    const contact = await this.findOrCreateContact(tenantId, payload.from.phone_number, 'sms');

    await this.supabase.from('interactions').insert([{
      tenant_id: tenantId,
      contact_id: contact.id,
      type: 'sms',
      metadata: {
        direction: 'inbound',
        summary: `SMS: "${payload.text}"`,
        message_id: payload.id
      }
    }]);
  }
}
