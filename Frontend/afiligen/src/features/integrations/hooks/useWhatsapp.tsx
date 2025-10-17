import { useEffect, useState } from 'react';
import {
  connect,
  disconnect,
  getStatus,
  getProfile,
} from '../../../services/integrations/whatsapp';

import { LoggedProfileResponse } from '../../../services/integrations/whatsapp';

export function useWhatsapp() {
  const [qr, setQr] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<LoggedProfileResponse | null>(null);

  const verifyProfile = async () => {
    const profile = await getProfile();
    if (profile) {
      setProfile(profile);
    }
  };

  const verifyStatus = async () => {
    try {
      const status = await getStatus();
      setStatus(status);
    } catch (err) {
      console.error('Erro ao obter status do WhatsApp:', err);
    }
  };

  useEffect(() => {
    verifyStatus();
    const interval = setInterval(
      verifyStatus,
      status === 'CONNECTED' ? 30000 : 5000,
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status === 'CONNECTED') {
      verifyProfile();
    }
  }, [status]);

  const handleWhatsappConnection = async () => {
    setLoading(true);
    try {
      const qr = await connect();
      if (qr) setQr(qr);
      return;
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsappDisconnection = async () => {
    setLoading(true);
    try {
      await disconnect();
      setQr(null);
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,
    qr,
    status,
    profile,
    handleWhatsappConnection,
    handleWhatsappDisconnection,
  };
}
