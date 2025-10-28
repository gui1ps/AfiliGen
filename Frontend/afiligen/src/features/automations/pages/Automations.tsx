import BaseLayout from '../../../components/layout/BaseLayout';
import useAutomations from '../hooks/useAutomations';
import Header from '../../../components/layout/Header';
import { Typography } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { WizardModal } from '../../../components/modals/WizardModal';
import { useCallback, useState } from 'react';
import useAutomationsForm from '../hooks/useWhatsappRoutineForm';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useQueryClient } from '@tanstack/react-query';
import Switch from '@mui/material/Switch';

export default function Automations() {
  const { whatsappRoutines, handleWhatsappRoutineUpdate } = useAutomations();
  const queryClient = useQueryClient();

  const {
    getRoutineCreationSteps,
    cleanWhatsappRoutineForm,
    handleRoutineSubmit,
  } = useAutomationsForm();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const routinesTable = useCallback(() => {
    return (
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
      >
        {whatsappRoutines.map((item, index) => (
          <Grid key={index} size={{ xs: 12, sm: 12, md: 3 }}>
            <Paper
              elevation={4}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 1,
                minHeight: '150px',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <Typography marginTop={1}>{item.name}</Typography>
              <Switch
                sx={{ position: 'absolute', top: 0, left: 165 }}
                checked={item.status === 'active'}
                onChange={async (e) => {
                  await handleWhatsappRoutineUpdate(
                    {
                      status: e.target.checked ? 'active' : 'paused',
                    },
                    item.id,
                  );
                  queryClient.invalidateQueries({
                    queryKey: ['whatsappRoutines'],
                  });
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }, [whatsappRoutines]);

  return (
    <BaseLayout>
      <Header
        title="Automações"
        subtitle="Crie e gerencie automações para enviar mensagens e posts
        automaticamente."
      />
      <Box
        display={'inline-flex'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Typography variant="h2" marginBottom={2}>
          Rotinas para WhatsApp
        </Typography>
        <IconButton
          onClick={() => {
            setActiveModal('routines');
          }}
        >
          <AddCircleIcon fontSize="large" />
        </IconButton>
      </Box>
      {routinesTable()}
      <WizardModal
        open={activeModal === 'routines'}
        onClose={() => {
          setActiveModal(null);
          cleanWhatsappRoutineForm();
        }}
        steps={getRoutineCreationSteps()}
        onFinish={async () => {
          await handleRoutineSubmit();
          queryClient.invalidateQueries({ queryKey: ['whatsappRoutines'] });
        }}
      />
    </BaseLayout>
  );
}
