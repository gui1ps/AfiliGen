import { useTheme } from '@mui/material/styles';
import { WhatsApp } from '@mui/icons-material';
import { WizardStep } from '../../../components/modals/WizardModal';
import Integration from '../../integrations/interfaces/Integration';
import { useWhatsapp } from '../../integrations/hooks/useWhatsapp';
import { createWhatsappRoutine } from '../../../services/automations/routines/whatsapp/whatsapp-routines';
import { toast } from 'react-toastify';

import { useWhatsappRoutineWizardState } from './useWhatsappRoutineWizardState';
import { StepChooseChannel } from '../components/wizard/StepChooseChannel';
import { StepRoutineConfig } from '../components/wizard/StepRoutineConfig';
import { StepChooseContacts } from '../components/wizard/StepChooseContacts';

const integrations: Integration[] = [
  { name: 'WhatsApp', logo: <WhatsApp fontSize="large" /> },
];

export default function useAutomationsForm() {
  const theme = useTheme();
  const { isLoading, contacts, status } = useWhatsapp();

  const {
    selectedChannel,
    setSelectedChannel,
    formData,
    setField,
    reset,
    isStepValid,
    minStartDate,
    minEndDate,
  } = useWhatsappRoutineWizardState();

  const getRoutineCreationSteps = (): WizardStep[] => [
    {
      title: 'Escolher Canal',
      content: () => (
        <StepChooseChannel
          theme={theme}
          integrations={integrations}
          selectedChannel={selectedChannel}
          onSelect={setSelectedChannel}
        />
      ),
      nextEnabled: () => !isStepValid(0),
    },
    {
      title: 'Realize as configurações',
      content: () => (
        <StepRoutineConfig
          formData={formData}
          setField={setField}
          minStartDate={minStartDate}
          minEndDate={minEndDate}
        />
      ),
      nextEnabled: () => !isStepValid(1),
    },
    {
      title: 'Escolha os contatos',
      content: () => (
        <StepChooseContacts
          contacts={contacts}
          isLoading={isLoading}
          status={status}
          selected={formData.recipients}
          onChangeSelected={(ids) => setField('recipients', ids)}
        />
      ),
      nextEnabled: () => !isStepValid(2),
    },
  ];

  const handleRoutineSubmit = async () => {
    try {
      await createWhatsappRoutine(formData);
      toast.success('Rotina criada com sucesso');
    } catch (error: any) {
      toast.error(`Erro ao criar rotina: ${error?.message ?? 'desconhecido'}`);
    }
  };

  return {
    getRoutineCreationSteps,
    formData,
    isStepValid,
    cleanWhatsappRoutineForm: reset,
    handleRoutineSubmit,
  };
}
