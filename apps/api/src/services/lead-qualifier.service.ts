import { SupabaseClient } from '@supabase/supabase-js';

interface QualificationData {
  isQualified: boolean;
  name: string | null;
  phone: string | null;
  service_needed: string | null;
}

export class LeadQualifierService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Very simple heuristic qualification for MVP.
   * If the LLM has collected a phone number format, we assume it's qualified.
   * In a real implementation, we would pass the chat history to a JSON-mode LLM prompt 
   * to strictly extract the fields.
   */
  async analyze(chatHistory: any[]): Promise<QualificationData> {
    const fullText = chatHistory
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n');

    // Simple regex to find a phone number in the chat history
    const phoneRegex = /(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})/;
    const phoneMatch = fullText.match(phoneRegex);

    if (phoneMatch) {
      // Attempt to extract a name (very naive, usually the first capitalized word before the phone number)
      // For MVP we just use 'Chat Lead' if we can't reliably parse it.
      return {
        isQualified: true,
        name: 'Chat Lead',
        phone: phoneMatch[0],
        service_needed: 'Requested via chat',
      };
    }

    return {
      isQualified: false,
      name: null,
      phone: null,
      service_needed: null,
    };
  }

  async createLead(tenantId: string, qualification: QualificationData) {
    // 1. Find or create Contact
    let contactId: string;
    const { data: existing } = await this.supabase
      .from('contacts')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('phone', qualification.phone)
      .single();

    if (existing) {
      contactId = existing.id;
    } else {
      const { data: newContact, error } = await this.supabase
        .from('contacts')
        .insert([{
          tenant_id: tenantId,
          first_name: qualification.name?.split(' ')[0] || 'Chat',
          last_name: qualification.name?.split(' ')[1] || 'Lead',
          phone: qualification.phone,
          source: 'chat_widget'
        }])
        .select()
        .single();
      
      if (error) throw error;
      contactId = newContact.id;
    }

    // 2. Create Deal
    const { data: firstStage } = await this.supabase
      .from('pipeline_stages')
      .select('id')
      .eq('tenant_id', tenantId)
      .order('position', { ascending: true })
      .limit(1)
      .single();

    if (!firstStage) throw new Error('No pipeline stages found.');

    const { data: deal, error: dealError } = await this.supabase
      .from('deals')
      .insert([{
        tenant_id: tenantId,
        contact_id: contactId,
        stage_id: firstStage.id,
        title: `Chat Lead - ${qualification.phone}`,
        priority: 'high',
        source: 'chat_widget'
      }])
      .select()
      .single();

    if (dealError) throw dealError;

    // 3. Log interaction
    await this.supabase.from('interactions').insert([{
      tenant_id: tenantId,
      contact_id: contactId,
      deal_id: deal.id,
      type: 'chat_widget',
      metadata: {
        direction: 'inbound',
        summary: `Qualified lead from website chat.`
      }
    }]);

    return { contactId, dealId: deal.id };
  }
}
