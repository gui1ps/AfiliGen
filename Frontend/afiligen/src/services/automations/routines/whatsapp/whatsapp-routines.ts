import api from '../../../api';

export interface WhatsAppRoutine {
  id: number;
  uuid: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  status: 'active' | 'paused' | 'finished';
  startAt: string | null; //ajustar
  endAt: string | null; //ajustar
  intervalSeconds: number;
  mode: 'single' | 'batch' | 'sequential';
  recipients: string[];
  lastSentMessageIndex: number;
  maxMessagesPerBlock: number;
}

export type WhatsappRoutinePayload = Omit<
  WhatsAppRoutine,
  | 'id'
  | 'uuid'
  | 'createdAt'
  | 'updatedAt'
  | 'mode'
  | 'intervalSeconds'
  | 'lastSentMessageIndex'
  | 'maxMessagesPerBlock'
>;

const getAllWhatsappRoutines = async (): Promise<WhatsAppRoutine[]> => {
  const response = await api.get('/automations/whatsapp/routines');
  return response.data;
};

const createWhatsappRoutine = async (
  routine: Omit<WhatsappRoutinePayload, 'status'>,
): Promise<WhatsAppRoutine> => {
  const response = await api.post('/automations/whatsapp/routines', routine);
  return response.data;
};

const updateWhatsappRoutine = async (
  data: Partial<WhatsappRoutinePayload>,
  id: number,
) => {
  const response = await api.patch(
    `/automations/whatsapp/routines/${id}`,
    data,
  );
  return response.data;
};

export { getAllWhatsappRoutines, createWhatsappRoutine, updateWhatsappRoutine };
