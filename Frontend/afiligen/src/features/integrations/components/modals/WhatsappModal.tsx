import { Button, Typography } from '@mui/material';
import { BaseModal } from '../../../../components/modals/BaseModal';
import { useWhatsapp } from '../../hooks/useWhatsapp';
import Box from '@mui/material/Box';
import { QRCodeCanvas } from 'qrcode.react';
import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import { ReactNode, useCallback, useEffect } from 'react';
import QrCode2Icon from '@mui/icons-material/QrCode2';

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
};

const whatsappBoxWh = 256;

export function WhatsappModal({ open, onClose }: EditProfileModalProps) {
  const { isLoading, qr, profile, handleWhatsappConnection, status } =
    useWhatsapp();

  const renderWhatsappBoxContent = useCallback((): ReactNode => {
    if (profile)
      return (
        <>
          <Avatar
            src={profile.profilePic as string}
            alt="Profile Picture"
            sx={{ width: 95, height: 95 }}
          />
          <Typography sx={{ marginTop: 1 }}>{profile.pushname}</Typography>
          <Typography sx={{ marginTop: 1 }}>
            {profile.id.replace('@c.us', '')}
          </Typography>
        </>
      );
    if (isLoading)
      return (
        <Skeleton
          variant="rectangular"
          width={whatsappBoxWh}
          height={whatsappBoxWh}
        />
      );
    if (qr) return <QRCodeCanvas value={qr} size={whatsappBoxWh} />;
    return (
      <Button
        variant="contained"
        startIcon={<QrCode2Icon />}
        onClick={handleWhatsappConnection}
      >
        QR Code
      </Button>
    );
  }, [isLoading, qr, profile, status]);

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="WhatsApp"
      subtitle="Configure a integração com o seu WhatsApp"
      fullScreenAt="sm"
      allowCloseOnBackdrop={false}
      actions={
        qr && (
          <Button
            variant="contained"
            startIcon={<QrCode2Icon />}
            onClick={handleWhatsappConnection}
          >
            Novo QR Code
          </Button>
        )
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: whatsappBoxWh,
        }}
      >
        {renderWhatsappBoxContent()}
      </Box>
    </BaseModal>
  );
}
