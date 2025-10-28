import BaseLayout from '../../../components/layout/BaseLayout';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Integration from '../interfaces/Integration';
import { WhatsApp } from '@mui/icons-material';
import { WhatsappModal } from '../components/modals/WhatsappModal';
import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Header from '../../../components/layout/Header';
import useAutomations from '../../automations/hooks/useAutomations';

const integrations: Integration[] = [
  { name: 'WhatsApp', logo: <WhatsApp fontSize="large" /> },
];

export default function Integrations() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { refetch, whatsappRoutines } = useAutomations();

  return (
    <BaseLayout>
      <Header
        title="Integrações"
        subtitle="Conecte tudo. Automatize o crescimento."
      />
      <Box sx={{ width: '100%' }}>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
        >
          {integrations.map((item, index) => (
            <Grid key={index} size={{ xs: 12, sm: 12, md: 3 }}>
              <Paper
                onClick={() => {
                  setActiveModal(item.name);
                }}
                elevation={4}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 1,
                  minHeight: '150px',
                  cursor: 'pointer',
                }}
              >
                {item.logo}
                <Typography marginTop={1}>{item.name}</Typography>
              </Paper>
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
