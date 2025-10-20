import { useEffect, useState, useCallback } from 'react';
import { connect, getProfile } from '../../../services/integrations/whatsapp';
import { LoggedProfileResponse } from '../../../services/integrations/whatsapp';
import { EventSource } from 'eventsource';

type Status = 'CONNECTED' | 'DISCONNECTED' | 'QR_READY' | 'PENDING' | null;

export function useWhatsapp() {
  const [qr, setQr] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [isLoading, setLoading] = useState(false);
  const [profile, setProfile] = useState<LoggedProfileResponse | null>(null);

  const verifyProfile = useCallback(async () => {
    try {
      const p = await getProfile();
      if (p) {
        setProfile(p);
      }
    } catch (err) {
      console.error('Erro ao obter perfil do WhatsApp:', err);
    }
  }, []);

  useEffect(() => {
    verifyProfile();
  }, [verifyProfile]);

  useEffect(() => {
    const access_token = localStorage.getItem('access_token');
    if (!access_token) return;

    const evtSource = new EventSource(
      'http://localhost:3000/integrations/whatsapp/status/stream',
      {
        withCredentials: true,
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            headers: {
              ...(init?.headers ?? {}),
              Authorization: `Bearer ${access_token}`,
            },
          }),
      },
    );

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setStatus((prev) => (prev !== data.status ? data.status : prev));
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    evtSource.onerror = (err) => {
      console.error('SSE error:', err);
    };

    return () => {
      evtSource.close();
    };
  }, []);

  useEffect(() => {
    if (status === 'CONNECTED') {
      verifyProfile();
    } else if (status) {
      setProfile(null);
      setQr(null);
    }
  }, [status, verifyProfile]);

  const handleWhatsappConnection = useCallback(async () => {
    setLoading(true);
    try {
      const qrCode = await connect();
      setQr(qrCode ?? null);
    } catch (error) {
      console.error('Falha ao conectar WhatsApp:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isLoading,
    qr: status !== 'CONNECTED' ? qr : null,
    status,
    profile,
    handleWhatsappConnection,
  };
}
