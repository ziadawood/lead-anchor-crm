// Call state constants

export const CALL_STATES = {
  IDLE: 'IDLE',
  RINGING: 'RINGING',
  IVR_ACTIVE: 'IVR_ACTIVE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ABANDONED: 'ABANDONED',
} as const;

export type CallState = typeof CALL_STATES[keyof typeof CALL_STATES];

// Hangup causes that trigger ghost lead capture
export const GHOST_LEAD_HANGUP_CAUSES = [
  'abandoned',
  'no_answer',
  'busy',
  'originator_cancel',
] as const;

export type GhostLeadHangupCause = typeof GHOST_LEAD_HANGUP_CAUSES[number];

export function isGhostLeadHangup(cause: string): cause is GhostLeadHangupCause {
  return GHOST_LEAD_HANGUP_CAUSES.includes(cause as GhostLeadHangupCause);
}
