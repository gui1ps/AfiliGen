import api from '../api';

export async function validateToken(
  token: string,
): Promise<{ valid: boolean }> {
  const response = await api.post('/auth/validate-token', { token });
  return response.data;
}
