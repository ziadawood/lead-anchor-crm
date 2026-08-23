// Default pipeline stage constants

export const DEFAULT_PIPELINE_STAGES = [
  { name: 'New Opportunity', position: 1, color: '#3B82F6', is_closed: false },
  { name: 'Quote Sent', position: 2, color: '#F59E0B', is_closed: false },
  { name: 'Deposit Paid', position: 3, color: '#10B981', is_closed: false },
  { name: 'Completed', position: 4, color: '#6366F1', is_closed: true },
] as const;

export const DEAL_PRIORITIES = ['high', 'medium', 'low'] as const;
export type DealPriority = typeof DEAL_PRIORITIES[number];

export const DEAL_SOURCES = [
  'phone',
  'chat',
  'website',
  'referral',
  'google',
  'ghost_lead',
  'manual',
  'sms',
] as const;
export type DealSource = typeof DEAL_SOURCES[number];
