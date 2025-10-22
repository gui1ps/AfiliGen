import BaseLayout from '../../../components/layout/BaseLayout';
import useAutomations from '../hooks/useAutomations';
import Header from '../../../components/layout/Header';
import { Typography } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { WizardModal } from '../../../components/modals/WizardModal';
import { useState } from 'react';
import useAutomationsForm from '../hooks/useAutomationsForm';

export default function Automations() {
  const { whatsappRoutines } = useAutomations();
  const { getRoutineCreationSteps } = useAutomationsForm();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const theme = useTheme();

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
        <Typography variant="h2">Rotinas</Typography>
        <IconButton
          onClick={() => {
            setActiveModal('routines');
          }}
        >
          <AddCircleIcon fontSize="large" />
        </IconButton>
      </Box>
      <WizardModal
        open={activeModal === 'routines'}
        onClose={() => setActiveModal(null)}
        steps={getRoutineCreationSteps()}
        onFinish={() => console.log('Rotina concluída!')}
      />
    </BaseLayout>
  );
}
