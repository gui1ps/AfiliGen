import api from '../api';

interface ConnectResponse {
  qr: string;
  status: string;
}

export interface LoggedProfileResponse {
  id: string;
  pushname: string | null;
  profilePic: string | null;
}

export interface WhatsAppContact {
  id: {
    server: string;
    user: string;
    _serialized: string;
  };
  number: string;
  isBusiness: boolean;
  isEnterprise: boolean;
  name?: string;
  pushname?: string;
  shortName?: string;
  statusMute: boolean;
  type: 'in' | 'out';
  isMe: boolean;
  isUser: boolean;
  isGroup: boolean;
  isWAContact: boolean;
  isMyContact: boolean;
  isBlocked: boolean;
}

const connect = async () => {
  const response = await api.get<ConnectResponse>(
    '/integrations/whatsapp/connect',
  );
  return response.data.qr;
};

const disconnect = async () => {
  await api.get('/integrations/whatsapp/disconnect');
};

const getStatus = async () => {
  const response = await api.get('/integrations/whatsapp/status');
  return response.data.status;
};

const getProfile = async (): Promise<LoggedProfileResponse> => {
  const response = await api.get('/integrations/whatsapp/profile');
  return response.data;
};

const getContacts = async (): Promise<WhatsAppContact[]> => {
  const response = await api.get('/integrations/whatsapp/contacts');
  return response.data;
};

const getChats = async () => {
  const response = await api.get('/integrations/whatsapp/chats');
  return response.data;
};

export { connect, disconnect, getStatus, getProfile, getContacts, getChats };
