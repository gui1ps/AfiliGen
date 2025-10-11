import api from '../api';
import { Credentials } from './login';

export interface CreateAccount extends Credentials {
  name: string;
}

export async function createAccount(payload: CreateAccount): Promise<any> {
  const response = await api.post<any>('/auth/register', payload);
  return response.data;
}
