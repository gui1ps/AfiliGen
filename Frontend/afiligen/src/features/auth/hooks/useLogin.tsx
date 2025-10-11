import { useState, useCallback } from "react";
import { login } from "../../../services/auth/login";
import { LoginPayload } from "../../../services/auth/login";

export interface LoginResponse{
    success:boolean,
    message:string
}

export function useLogin() {
  const [loading, setLoading] = useState(false)

  const handleLogin = useCallback(async ({ email, password }: LoginPayload): Promise<LoginResponse> => {
    setLoading(true)

    try {
      const trimmedEmail = email.trim()
      const trimmedPassword = password.trim()

      const response = await login({ email: trimmedEmail, password: trimmedPassword })
      const token = response?.access_token

      if (token) {
        localStorage.setItem('access_token', token)
        return { success: true, message: 'Login realizado com sucesso!' }
      }

      return { success: false, message: 'Token não encontrado na resposta.' }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, message: 'Falha ao realizar login. Verifique suas credenciais.' }
    } finally {
      setLoading(false)
    }
  }, [])

  return { handleLogin, loading }
}