import api from '../../../api';

export interface WhatsAppRoutine {
  id: number;
  uuid: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  status: 'active' | 'paused' | 'finished';
  startAt: string;
  endAt: string;
  intervalSeconds: number;
  mode: 'single' | 'batch' | 'sequential';
  recipients: string[];
  lastSentMessageIndex: number;
  maxMessagesPerBlock: number;
}

const getAllWhatsappRoutines = async (): Promise<WhatsAppRoutine[]> => {
  const response = await api.get<WhatsAppRoutine[]>(
    '/automations/whatsapp/routines',
  );
  return response.data;
};

export { getAllWhatsappRoutines };
