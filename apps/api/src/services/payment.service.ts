import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';

export class PaymentService {
  private stripe: Stripe | null = null;
  private isSandbox = false;

  constructor(private supabase: SupabaseClient, stripeKey?: string) {
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' as any });
    } else {
      this.isSandbox = true;
    }
  }

  /**
   * Creates a Connect account onboarding link for a tenant
   */
  async onboardTenant(tenantId: string, returnUrl: string) {
    if (this.isSandbox) {
      console.log(`[PaymentService Sandbox] Onboarding mock Connect account for tenant ${tenantId}`);
      // Simulate successful onboarding by saving a mock ID
      await this.supabase
        .from('tenants')
        .update({ stripe_account_id: `acct_mock_${tenantId.substring(0,8)}` })
        .eq('id', tenantId);
      
      return { url: `${returnUrl}?success=true&mock=true` };
    }

    if (!this.stripe) throw new Error('Stripe is not configured.');

    // 1. Create Connect Account
    const account = await this.stripe.accounts.create({
      type: 'standard',
      metadata: { tenant_id: tenantId },
    });

    // 2. Save ID to tenant
    await this.supabase
      .from('tenants')
      .update({ stripe_account_id: account.id })
      .eq('id', tenantId);

    // 3. Create Account Link
    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${returnUrl}?retry=true`,
      return_url: `${returnUrl}?success=true`,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  }

  /**
   * Creates a payment link for a deal (Deposit collection)
   */
  async createPaymentLink(tenantId: string, dealId: string, amountCents: number, itemName: string, returnUrl: string) {
    // 1. Get tenant's connected account ID
    const { data: tenant } = await this.supabase
      .from('tenants')
      .select('stripe_account_id')
      .eq('id', tenantId)
      .single();

    if (!tenant?.stripe_account_id) {
      throw new Error('Tenant has not connected a Stripe account.');
    }

    if (this.isSandbox) {
      console.log(`[PaymentService Sandbox] Generating mock payment link for deal ${dealId}`);
      return { url: `https://sandbox.leadanchor.app/pay?deal=${dealId}&amount=${amountCents}` };
    }

    if (!this.stripe) throw new Error('Stripe is not configured.');

    // 2. Create Stripe Payment Link
    const paymentLink = await this.stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: itemName },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        tenant_id: tenantId,
        deal_id: dealId,
      },
      after_completion: {
        type: 'redirect',
        redirect: { url: returnUrl },
      },
    }, {
      stripeAccount: tenant.stripe_account_id,
    });

    return { url: paymentLink.url };
  }
}
