import { Button } from '@mui/material';
import { BaseModal } from './BaseModal';
import { useWhatsapp } from '../../hooks/useWhatsapp';
import Box from '@mui/material/Box';
import { QRCodeCanvas } from 'qrcode.react';
import Skeleton from '@mui/material/Skeleton';
import { useEffect } from 'react';
import Avatar from '@mui/material/Avatar';

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
};

export function WhatsappModal({ open, onClose }: EditProfileModalProps) {
  const {
    isLoading,
    qr,
    profile,
    handleWhatsappConnection,
    handleWhatsappDisconnection,
    status,
  } = useWhatsapp();

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
            QR Code
          </Button>
          <Button variant="contained" onClick={handleWhatsappDisconnection}>
            Desconectar
          </Button>
        </>
      }
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: 256,
        }}
      >
        {isLoading && (
          <Skeleton variant="rectangular" width={256} height={256} />
        )}
        {!profile && !isLoading && qr && <QRCodeCanvas value={qr} size={256} />}
        {profile && (
          <Avatar
            src={profile.profilePic as string}
            sx={{ width: 70, height: 70 }}
          />
        )}
      </Box>
    </BaseModal>
  );
}
