import api from '../api';

interface ConnectResponse {
  qr: string;
  status: string;
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

export { connect, disconnect };
