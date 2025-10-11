import api from '../api';

export interface Credentials {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
}

export async function login(payload: Credentials): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', payload);
  return response.data;
}
