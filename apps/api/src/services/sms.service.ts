import Telnyx from 'telnyx';

export class SmsService {
  private telnyx: any;
  private isSandbox: boolean;

  constructor(apiKey: string | undefined) {
    this.isSandbox = !apiKey || apiKey === 'mock-key';
    if (!this.isSandbox) {
      this.telnyx = new (Telnyx as any)(apiKey);
    }
  }

  async sendSms(tenantId: string, from: string, to: string, text: string) {
    if (this.isSandbox) {
      console.log(`[SmsService Sandbox] 🚀 SMS SENT to ${to}`);
      console.log(`[SmsService Sandbox] From: ${from} | Tenant: ${tenantId}`);
      console.log(`[SmsService Sandbox] Body: "${text}"`);
      return { id: `mock_sms_${Date.now()}` };
    }

    try {
      console.log(`[SmsService] Dispatching SMS via Telnyx to ${to}...`);
      const message = await this.telnyx.messages.create({
        from,
        to,
        text,
        // In a real implementation, you might pass messaging_profile_id here if required by your Telnyx setup
      });
      return message;
    } catch (error: any) {
      console.error(`[SmsService] Failed to send SMS:`, error.message);
      throw error;
    }
  }
}
