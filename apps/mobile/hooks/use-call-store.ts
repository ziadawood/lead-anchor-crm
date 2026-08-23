import { create } from 'zustand';

interface CallState {
  isCallActive: boolean;
  callerNumber: string | null;
  callerName: string | null;
  callId: string | null;
  setIncomingCall: (callId: string, number: string, name?: string) => void;
  endCall: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  isCallActive: false,
  callerNumber: null,
  callerName: null,
  callId: null,
  setIncomingCall: (callId, number, name) => 
    set({ isCallActive: true, callId, callerNumber: number, callerName: name || null }),
  endCall: () => 
    set({ isCallActive: false, callId: null, callerNumber: null, callerName: null }),
}));
