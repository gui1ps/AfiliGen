import api from '../../../api';
import { WhatsappRoutineFormData } from '../../../../features/automations/hooks/useWhatsappRoutineWizardState';

export interface RoutineMessage {
  id: number;
  uuid: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  mediaPath?: string | null;
  mimeType?: string | null;
  caption?: string | null;
  status: string;
}

export interface Block {
  id: number;
  uuid: string;
  createdAt: string;
  updatedAt: string;
  triggerTime: string;
  sent: boolean;
  active: boolean;
  messages: RoutineMessage[];
}

export interface WhatsAppRoutine {
  id: number;
  uuid: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  status: 'active' | 'paused' | 'finished';
  startAt: string | null;
  endAt: string | null;
  messages?: RoutineMessage[];
  intervalSeconds: number;
  mode: 'single' | 'batch' | 'sequential';
  recipients: string[];
  lastSentMessageIndex: number;
  maxMessagesPerBlock: number;
  chatAppMessageBlock: Block[];
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
  | 'chatAppMessageBlock'
>;

export interface CreateBlock {
  triggerTime: string;
  routineId: number;
}

export interface CreateBlockReponse {
  id: number;
  uuid: string;
  createdAt: string;
  updatedAt: string;
  routine: WhatsAppRoutine;
  triggerTime: string | null;
  sent: boolean;
  active: boolean;
}

const getAllWhatsappRoutines = async (): Promise<WhatsAppRoutine[]> => {
  const response = await api.get('/automations/whatsapp/routines');
  return response.data;
};

const getOneWhatsappRoutine = async (id: number): Promise<WhatsAppRoutine> => {
  const response = await api.get(`/automations/whatsapp/routines/${id}`);
  return response.data;
};

const createWhatsappRoutine = async (
  routine: Omit<WhatsappRoutinePayload, 'status'>,
): Promise<WhatsAppRoutine> => {
  const response = await api.post('/automations/whatsapp/routines', routine);
  return response.data;
};

const updateWhatsappRoutine = async (
  data: Partial<WhatsappRoutineFormData>,
  id: number,
) => {
  const response = await api.patch(
    `/automations/whatsapp/routines/${id}`,
    data,
  );
  return response.data;
};

const deleteWhatsappRoutine = async (id: number) => {
  const response = await api.delete(`/automations/whatsapp/routines/${id}`);
  return response.data;
};

const addMessageToWhatsappRoutine = async (
  id: number,
  data: Omit<
    RoutineMessage,
    'id' | 'uuid' | 'createdAt' | 'updatedAt' | 'status'
  >,
) => {
  const response = await api.post(
    `/automations/whatsapp/routines/${id}/messages`,
    data,
  );
  return response.data;
};

const updateWhatsappRoutineMessage = async (
  routineId: number,
  messageId: number,
  data: Partial<
    Omit<RoutineMessage, 'id' | 'uuid' | 'createdAt' | 'updatedAt' | 'status'>
  >,
) => {
  const response = await api.patch(
    `/automations/whatsapp/routines/${routineId}/messages/${messageId}`,
    data,
  );
  return response.data;
};

const removeWhatsappRoutineMessage = async (
  routineId: number,
  messageId: number,
) => {
  const response = await api.delete(
    `/automations/whatsapp/routines/${routineId}/messages/${messageId}`,
  );
  return response.data;
};

const createBlock = async (data: CreateBlock): Promise<WhatsAppRoutine> => {
  const response = await api.post('/automations/whatsapp/blocks', data);
  return response.data;
};

const updateBlock = async (
  id: number,
  data: Omit<CreateBlock, 'routineId'>,
) => {
  const response = await api.patch(`/automations/whatsapp/blocks/${id}`, data);
  return response.data;
};

const removeBlock = async (id: number) => {
  const response = await api.delete(`/automations/whatsapp/blocks/${id}`);
  return response.data;
};

export {
  getAllWhatsappRoutines,
  getOneWhatsappRoutine,
  createWhatsappRoutine,
  updateWhatsappRoutine,
  deleteWhatsappRoutine,
  addMessageToWhatsappRoutine,
  updateWhatsappRoutineMessage,
  removeWhatsappRoutineMessage,
  createBlock,
  updateBlock,
  removeBlock,
};
