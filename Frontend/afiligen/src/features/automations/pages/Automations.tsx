import BaseLayout from '../../../components/layout/BaseLayout';
import useAutomations from '../hooks/useAutomations';
import Header from '../../../components/layout/Header';
import { Typography } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { WizardModal } from '../../../components/modals/WizardModal';
import { useCallback, useEffect, useState } from 'react';
import useAutomationsForm from '../hooks/useWhatsappRoutineForm';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useQueryClient } from '@tanstack/react-query';
import Switch from '@mui/material/Switch';
import EditIcon from '@mui/icons-material/Edit';
import { Delete } from '@mui/icons-material';
import MessageIcon from '@mui/icons-material/Message';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ContactsIcon from '@mui/icons-material/Contacts';
import Tooltip from '@mui/material/Tooltip';
import WhatsappRoutineModal from '../components/modals/WhatsappRoutineModal/WhatsappRoutineModal';
import { WhatsAppModalType } from '../components/modals/WhatsappRoutineModal/WhatsappRoutineModal';

interface ModalState<T = any> {
  type?: WhatsAppModalType;
  data?: any;
}

const hoverStyles = {
  ':hover': {
    backgroundColor: '#F46829',
    color: '#FBFBFB',
  },
};

export default function Automations() {
  const { whatsappRoutines, handleWhatsappRoutineUpdate } = useAutomations();
  const queryClient = useQueryClient();

  const [activeModal, setActiveModal] = useState<ModalState>({
    type: undefined,
  });

  const whatsappModalTypes = [
    'routines',
    'routine_message',
    'routine_block',
    'routine_edition',
    'routine_contacts',
  ];

  const whatsAppRoutineActionButtons = [
    { icon: <EditIcon />, type: 'routine_edition', tooltip: 'Editar rotina' },
    {
      icon: <Delete />,
      type: 'delete_routine',
      tooltip: 'Deletar Rotina',
    },
    {
      icon: <MessageIcon />,
      type: 'routine_message',
      tooltip: 'Mensagens',
    },
    {
      icon: <ListAltIcon />,
      type: 'routine_block',
      tooltip: 'Blocos',
    },
    {
      icon: <ContactsIcon />,
      type: 'routine_contacts',
      tooltip: 'Contatos',
    },
  ];

  const openModal = useCallback((type: WhatsAppModalType, data?: any) => {
    setActiveModal({ type, data });
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal({ type: undefined, data: undefined });
  }, []);

  useEffect(() => {
    console.log(activeModal);
  }, [activeModal]);

  const {
    getRoutineCreationSteps,
    cleanWhatsappRoutineForm,
    handleRoutineSubmit,
  } = useAutomationsForm();

  const routinesTable = useCallback(() => {
    return (
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
      >
        {whatsappRoutines
          .sort((a, b) => a.id - b.id)
          .map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 12, md: 3 }}>
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
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  flex={1}
                  width={'100%'}
                  paddingLeft={1}
                  paddingRight={1}
                >
                  <Tooltip
                    title={
                      item.status === 'active'
                        ? 'Pausar Rotina'
                        : 'Ativar Rotina'
                    }
                  >
                    <Switch
                      checked={item.status === 'active'}
                      onChange={async (e) => {
                        await handleWhatsappRoutineUpdate(
                          { status: e.target.checked ? 'active' : 'paused' },
                          item.id,
                        );
                      }}
                    />
                  </Tooltip>
                  <Box>
                    {whatsAppRoutineActionButtons.map((btn) => (
                      <Tooltip key={btn.type} title={btn.tooltip} arrow>
                        <IconButton
                          sx={hoverStyles}
                          onClick={() =>
                            openModal(btn.type as WhatsAppModalType, item)
                          }
                        >
                          {btn.icon}
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
                <Typography marginTop={1} flex={4}>
                  {item.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
      </Grid>
    );
  }, [whatsappRoutines, handleWhatsappRoutineUpdate, openModal]);

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
            openModal('routines');
          }}
        >
          <AddCircleIcon fontSize="large" />
        </IconButton>
      </Box>
      {routinesTable()}
      <WizardModal
        open={activeModal.type === 'routines'}
        onClose={() => {
          closeModal();
          cleanWhatsappRoutineForm();
        }}
        steps={getRoutineCreationSteps()}
        onFinish={async () => {
          await handleRoutineSubmit();
          queryClient.invalidateQueries({ queryKey: ['whatsappRoutines'] });
        }}
      />
      <WhatsappRoutineModal
        open={[
          'routine_message',
          'routine_block',
          'routine_edition',
          'routine_contacts',
          'delete_routine',
        ].includes(activeModal.type || '')}
        onClose={() => closeModal()}
        onSaved={async () => {
          queryClient.invalidateQueries({
            queryKey: ['whatsappRoutines'],
          });
        }}
        type={activeModal.type}
        item={activeModal.data}
      />
    </BaseLayout>
  );
}
