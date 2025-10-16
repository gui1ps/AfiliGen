import { useState, useCallback } from 'react';
import { login } from '../../../services/auth/login';
import { createAccount } from '../../../services/auth/create-account';
import { Credentials } from '../../../services/auth/login';
import { CreateAccount } from '../../../services/auth/create-account';

export interface AuthResponse {
  success: boolean;
  message: string;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(
    async ({ email, password }: Credentials): Promise<AuthResponse> => {
      setLoading(true);

      try {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        const response = await login({
          email: trimmedEmail,
          password: trimmedPassword,
        });
        const token = response?.access_token;

        if (token) {
          localStorage.setItem('access_token', token);
          return { success: true, message: 'Login realizado com sucesso!' };
        }

        return { success: false, message: 'Token não encontrado na resposta.' };
      } catch (error) {
        console.error('Erro no login:', error);
        return {
          success: false,
          message: 'Falha ao realizar login. Verifique suas credenciais.',
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleCreateAccount = useCallback(
    async ({ email, password, name }: CreateAccount): Promise<AuthResponse> => {
      setLoading(true);

      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const trimmedName = name.trim();

      try {
        await createAccount({
          email: trimmedEmail,
          name: trimmedName,
          password: trimmedPassword,
        });
        return { success: true, message: 'Usuário cadastrado com sucesso!' };
      } catch (error) {
        console.error('Erro no login:', error);
        return { success: false, message: 'O cadastro falhou!' };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleLogout = useCallback((): AuthResponse => {
    try {
      localStorage.clear();
      return {
        success: true,
        message: 'Storage limpo.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha ao limpar storage.',
      };
    }
  }, []);

  return { handleLogin, handleCreateAccount, handleLogout, loading };
}
