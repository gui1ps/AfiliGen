import { create } from 'zustand';
import { LoggedProfileResponse } from '../services/integrations/whatsapp';
import { WhatsAppContact } from '../services/integrations/whatsapp';

type WhatsAppState = {
  profile: LoggedProfileResponse | null;
  contacts: WhatsAppContact[];
  setProfile: (profile: LoggedProfileResponse | null) => void;
  setContacts: (contacts: WhatsAppContact[]) => void;
};

export const useWhatsAppStore = create<WhatsAppState>((set) => ({
  profile: null,
  contacts: [],
  setProfile: (profile) => set({ profile }),
  setContacts: (contacts) => set({ contacts }),
}));
