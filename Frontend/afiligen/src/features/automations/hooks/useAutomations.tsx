import { useEffect, useState } from 'react';
import {
  getAllWhatsappRoutines,
  updateWhatsappRoutine,
} from '../../../services/automations/routines/whatsapp/whatsapp-routines';
import { WhatsAppRoutine } from '../../../services/automations/routines/whatsapp/whatsapp-routines';
import { useQuery } from '@tanstack/react-query';
import { WhatsappRoutinePayload } from '../../../services/automations/routines/whatsapp/whatsapp-routines';

export default function useAutomations() {
  const [whatsappRoutines, setWhatsappRoutines] = useState<WhatsAppRoutine[]>(
    [],
  );

  const { data, refetch } = useQuery({
    queryKey: ['whatsappRoutines'],
    queryFn: async () => {
      return await getAllWhatsappRoutines();
    },
  });

  const handleWhatsappRoutineUpdate = async (
    data: Partial<WhatsappRoutinePayload>,
    id: number,
  ) => {
    try {
      await updateWhatsappRoutine(data, id);
    } catch {}
  };

  useEffect(() => {
    if (data) {
      setWhatsappRoutines(data);
    }
  }, [data]);

  return { whatsappRoutines, refetch, handleWhatsappRoutineUpdate };
}
