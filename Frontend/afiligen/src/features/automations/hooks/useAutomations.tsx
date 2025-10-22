import { useEffect, useState } from 'react';
import { getAllWhatsappRoutines } from '../../../services/automations/routines/whatsapp/whatsapp-routines';
import { WhatsAppRoutine } from '../../../services/automations/routines/whatsapp/whatsapp-routines';
import Integration from '../../integrations/interfaces/Integration';
import { WhatsApp } from '@mui/icons-material';

const integrations: Integration[] = [
  { name: 'WhatsApp', logo: <WhatsApp fontSize="large" /> },
];

export default function useAutomations() {
  const [whatsappRoutines, setWhatsappRoutines] = useState<WhatsAppRoutine[]>(
    [],
  );

  const loadWhatsappRoutines = async () => {
    const routines = await getAllWhatsappRoutines();
    setWhatsappRoutines(routines);
  };

  useEffect(() => {
    loadWhatsappRoutines();
  }, []);

  return { whatsappRoutines };
}
