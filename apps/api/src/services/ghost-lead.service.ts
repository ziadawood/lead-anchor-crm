import { SupabaseClient } from '@supabase/supabase-js';
import { SmsService } from './sms.service';

export class GhostLeadService {
  constructor(
    private supabase: SupabaseClient,
    private smsService: SmsService
  ) {}

  async processAbandonedCall(tenantId: string, payload: any) {
    console.log(`[GhostLeadEngine] 👻 Processing abandoned call from ${payload.from} for tenant ${tenantId}`);

    // 1. Find or create contact
    let contactId: string;
    const { data: existingContact } = await this.supabase
      .from('contacts')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('phone', payload.from)
      .single();

    if (existingContact) {
      contactId = existingContact.id;
    } else {
      const { data: newContact, error: contactError } = await this.supabase
        .from('contacts')
        .insert([{
          tenant_id: tenantId,
          phone: payload.from,
          first_name: 'Unknown',
          last_name: 'Caller',
          source: 'ghost_lead',
        }])
        .select()
        .single();
        
      if (contactError) throw contactError;
      contactId = newContact.id;
    }

    // 2. Create Deal in "New Opportunity" stage (position 1)
    const { data: firstStage } = await this.supabase
      .from('pipeline_stages')
      .select('id')
      .eq('tenant_id', tenantId)
      .order('position', { ascending: true })
      .limit(1)
      .single();

    if (!firstStage) {
      console.warn(`[GhostLeadEngine] No pipeline stages found for tenant ${tenantId}`);
      return;
    }

    const { data: deal, error: dealError } = await this.supabase
      .from('deals')
      .insert([{
        tenant_id: tenantId,
        contact_id: contactId,
        stage_id: firstStage.id,
        title: `Ghost Lead - ${payload.from}`,
        priority: 'high',
        source: 'ghost_lead',
      }])
      .select()
      .single();
      
    if (dealError) throw dealError;

    // 3. Log Interaction
    await this.supabase.from('interactions').insert([{
      tenant_id: tenantId,
      contact_id: contactId,
      deal_id: deal.id,
      type: 'ghost_lead',
      metadata: {
        direction: 'inbound',
        call_session_id: payload.call_session_id,
        hangup_cause: payload.hangup_cause,
        summary: `🚨 Ghost Lead Captured (Cause: ${payload.hangup_cause})`
      }
    }]);

    // 4. Send SMS Follow-up
    // Retrieve tenant's business name for the template
    const { data: tenant } = await this.supabase.from('tenants').select('name').eq('id', tenantId).single();
    const businessName = tenant?.name || 'our team';
    
    const smsTemplate = `Hi! We noticed you called ${businessName}. We are on the other line but can help! Reply YES for a callback or tell us what you need here.`;
    
    await this.smsService.sendSms(tenantId, payload.to, payload.from, smsTemplate);

    // 5. Trigger Realtime Notification for the Dashboard (handled automatically by Supabase Realtime if subscribed on frontend)
    console.log(`[GhostLeadEngine] 👻 Ghost Lead successfully processed and deal ${deal.id} created.`);
  }
}
