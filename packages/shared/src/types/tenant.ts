// Tenant types

export interface ITenant {
  id: string;
  name: string;
  slug: string;
  track: TenantTrack;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  hours: string | null;
  logo_url: string | null;
  website_theme: IWebsiteTheme;
  integrations: ITenantIntegrations;
  ghost_lead_config: IGhostLeadConfig;
  stripe_account_id: string | null;
  telnyx_connection_id: string | null;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export type TenantTrack = 'trades' | 'predictable_services';

export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise';

export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing';

export interface ITenantIntegrations {
  telnyx: boolean;
  stripe: boolean;
  google_business: boolean;
}

export interface IGhostLeadConfig {
  enabled: boolean;
  sms_template: string | null;
  sms_delay_seconds: number;
  auto_assign_to: string | null;
  notify_all_agents: boolean;
}

export interface IWebsiteTheme {
  template: 'professional-dark' | 'clean-light' | 'modern-gradient' | 'bold-contrast';
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
}
