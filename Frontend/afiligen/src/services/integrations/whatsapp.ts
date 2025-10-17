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

export { connect, disconnect, getStatus, getProfile };
