import * as React from 'react';
import { Button } from '@mui/material';
import { BaseModal } from './BaseModal';
import { useState } from 'react';
import {
  connect,
  disconnect,
} from '../../../../services/integrations/whatsapp';
import { QRCodeCanvas } from 'qrcode.react';

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
};

export function WhatsappModal({ open, onClose }: EditProfileModalProps) {
  const [qr, setQr] = useState<string | null>(null);

  const handleWhatsappConnection = async () => {
    try {
      const qr = await connect();
      if (qr) setQr(qr);
      return;
    } catch (error) {
      alert(error);
    }
  };

  const handleWhatsappDisconnection = async () => {
    try {
      await disconnect();
      setQr(null);
    } catch (error) {
      alert(error);
    }
  };

  const showQrCode = () => {
    if (qr) {
      return <QRCodeCanvas value={qr} size={256} />;
    }
    return <p>Carregando...</p>;
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="WhatsApp"
      subtitle="Configure a integração com o seu WhatsApp"
      fullScreenAt="sm"
      allowCloseOnBackdrop={false}
      actions={
        <>
          <Button onClick={handleWhatsappConnection} variant="outlined">
            Conectar
          </Button>
          <Button variant="contained" onClick={handleWhatsappDisconnection}>
            Desconectar
          </Button>
        </>
      }
    >
      {showQrCode()}
    </BaseModal>
  );
}
