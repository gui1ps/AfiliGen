import BaseLayout from '../../../components/layout/BaseLayout';
import { IconButton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Integration from '../interfaces/Integration';
import { WhatsApp } from '@mui/icons-material';
import { WhatsappModal } from '../components/modals/WhatsappModal';
import { useState } from 'react';

const integrations: Integration[] = [
  { name: 'WhatsApp', logo: <WhatsApp fontSize="large" /> },
];

export default function Integrations() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  return (
    <BaseLayout>
      <Typography variant={'h2'} marginBottom={1}>
        Integrações
      </Typography>
      <Box sx={{ width: '100%' }}>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
        >
          {integrations.map((item, index) => (
            <Grid key={index} size={{ xs: 2, sm: 4, md: 4 }}>
              <IconButton
                onClick={() => {
                  setActiveModal(item.name);
                }}
              >
                {item.logo}
              </IconButton>
            </Grid>
          ))}
        </Grid>
      </Box>
      <WhatsappModal
        open={activeModal === 'WhatsApp'}
        onClose={() => {
          setActiveModal(null);
        }}
      />
    </BaseLayout>
  );
}
