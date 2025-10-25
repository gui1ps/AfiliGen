import { useEffect, useState, useCallback } from 'react';
import {
  connect,
  getProfile,
  getContacts,
} from '../../../services/integrations/whatsapp';
import { EventSource } from 'eventsource';
import { useWhatsAppStore } from '../../../store/whatsappStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoggedProfileResponse } from '../../../services/integrations/whatsapp';

type Status = 'CONNECTED' | 'DISCONNECTED' | 'QR_READY' | 'PENDING' | null;

export function useWhatsapp() {
  const [status, setStatus] = useState<Status>(null);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  const { profile, setProfile, contacts, setContacts } = useWhatsAppStore();

  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['whatsappProfile'],
    queryFn: async () => await getProfile(),
    enabled: status === 'CONNECTED',
    staleTime: 5 * 60 * 1000,
  });

  const contactsQuery = useQuery({
    queryKey: ['whatsappContacts'],
    queryFn: async () => await getContacts(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (profileQuery.data) {
      setProfile(profileQuery.data);
    }
    if (profileQuery.error) {
      setError('Não foi possível obter o perfil do WhatsApp');
    }
  }, [profileQuery.data, profileQuery.error, setProfile]);

  useEffect(() => {
    if (contactsQuery.data) {
      setContacts(contactsQuery.data);
    }
    if (contactsQuery.error) {
      setError('Erro ao tentar obter contatos');
    }
  }, [contactsQuery.data, contactsQuery.error, setContacts]);

  useEffect(() => {
    let mounted = true;

    async function singleCheckProfileOnMount() {
      try {
        const cached = queryClient.getQueryData<LoggedProfileResponse>([
          'whatsappProfile',
        ]);
        if (cached) {
          if (mounted) setProfile(cached);
          return;
        }
      } catch {}

      try {
        const p = await getProfile();
        if (!mounted) return;
        if (p) {
          setProfile(p);
          try {
            queryClient.setQueryData(['whatsappProfile'], p);
          } catch {}
        }
      } catch {}
    }

    singleCheckProfileOnMount();

    return () => {
      mounted = false;
    };
  }, []);

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

    evtSource.onerror = (e) => {
      console.error('SSE error', e);
    };

    return () => {
      evtSource.close();
    };
  }, []);

  useEffect(() => {
    if (status === 'CONNECTED') {
      profileQuery.refetch().catch(() => {});
      contactsQuery.refetch().catch(() => {});
    } else if (
      status === 'DISCONNECTED' ||
      status === 'QR_READY' ||
      status === 'PENDING'
    ) {
      setProfile(null);
      setQr(null);

      queryClient
        .cancelQueries({ queryKey: ['whatsappProfile'] })
        .catch(() => {});
      queryClient
        .cancelQueries({ queryKey: ['whatsappContacts'] })
        .catch(() => {});

      try {
        queryClient.setQueryData(['whatsappProfile'], undefined as unknown);
        queryClient.setQueryData(['whatsappContacts'], undefined as unknown);
      } catch {}
    }
  }, [status]);

  const handleGetQr = useCallback(async () => {
    setLoading(true);
    try {
      const qrCode = await connect();
      setQr(qrCode ?? null);
    } catch (err) {
      console.error('Falha ao conectar WhatsApp:', err);
      setError('Falha ao gerar QR code');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isLoading,
    qr: status !== 'CONNECTED' ? qr : null,
    status,
    profile,
    handleGetQr,
    refetchProfile: profileQuery.refetch,
    refetchContacts: contactsQuery.refetch,
    error,
    contacts,
  };
}
