import { useEffect, useState } from 'react';
import { getAllWhatsappRoutines } from '../../../services/automations/routines/whatsapp/whatsapp-routines';
import { WhatsAppRoutine } from '../../../services/automations/routines/whatsapp/whatsapp-routines';

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
