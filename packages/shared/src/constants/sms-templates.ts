// SMS template constants

export const SMS_TEMPLATES = {
  /** Sent automatically when a ghost lead is captured */
  GHOST_LEAD_FOLLOW_UP:
    'Hi! We noticed you called {business_name}. Can we help? ' +
    'Reply YES for a callback or visit {intake_url} to describe your issue.',

  /** Sent automatically when a ghost lead is captured (trades track) */
  GHOST_LEAD_FOLLOW_UP_TRADES:
    '{business_name} here! We saw your call. Need emergency service? ' +
    'Reply YES and we\'ll call you right back, or tap here to describe your issue: {intake_url}',

  /** Sent automatically when a ghost lead is captured (predictable track) */
  GHOST_LEAD_FOLLOW_UP_PREDICTABLE:
    'Thanks for calling {business_name}! We\'d love to help. ' +
    'Reply with a good time to call you back, or book online: {booking_url}',

  /** Sent when a quote is dispatched */
  QUOTE_SENT:
    '{business_name}: Your quote is ready! View and approve it here: {quote_url}',

  /** Sent when a deposit payment is received */
  DEPOSIT_CONFIRMED:
    '{business_name}: We\'ve received your deposit of {amount}. ' +
    'We\'ll be in touch to schedule your service. Thank you!',

  /** Sent when a booking is confirmed */
  BOOKING_CONFIRMATION:
    '{business_name}: Your appointment is confirmed for {date} at {time}. ' +
    'Reply CANCEL to cancel. See you then!',

  /** Sent 24h before a booking */
  BOOKING_REMINDER:
    '{business_name} reminder: You have an appointment tomorrow at {time}. ' +
    'Reply CONFIRM to confirm or RESCHEDULE to change.',

  /** Sent after a completed job */
  REVIEW_REQUEST:
    'Thank you for choosing {business_name}! We hope you\'re satisfied. ' +
    'We\'d appreciate a quick review: {review_url}',
} as const;

export type SmsTemplateKey = keyof typeof SMS_TEMPLATES;

/**
 * Replace template variables with actual values
 */
export function renderSmsTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return Object.entries(variables).reduce(
    (text, [key, value]) => text.replace(new RegExp(`\\{${key}\\}`, 'g'), value),
    template
  );
}
