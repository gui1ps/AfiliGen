import { useEffect, useState, useCallback } from 'react';
import {
  getAllWhatsappRoutines,
  updateWhatsappRoutine,
  WhatsAppRoutine,
  WhatsappRoutinePayload,
} from '../../../services/automations/routines/whatsapp/whatsapp-routines';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function useAutomations() {
  const [whatsappRoutines, setWhatsappRoutines] = useState<WhatsAppRoutine[]>(
    [],
  );
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery({
    queryKey: ['whatsappRoutines'],
    queryFn: async () => {
      return await getAllWhatsappRoutines();
    },
  });

  const handleWhatsappRoutineUpdate = useCallback(
    async (data: Partial<WhatsappRoutinePayload>, id: number) => {
      try {
        const updatedRoutine = await updateWhatsappRoutine(data, id);

        setWhatsappRoutines((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...updatedRoutine } : r)),
        );

        queryClient.setQueryData(['whatsappRoutines'], (oldData: any) => {
          if (!oldData) return [];
          return oldData.map((r: WhatsAppRoutine) =>
            r.id === id ? { ...r, ...updatedRoutine } : r,
          );
        });
      } catch (error) {
        console.error('Erro ao atualizar rotina:', error);
      }
    },
    [queryClient],
  );

  useEffect(() => {
    if (data) {
      setWhatsappRoutines((prev) => {
        const isEqual = JSON.stringify(prev) === JSON.stringify(data);
        return isEqual ? prev : data;
      });
    }
  }, [data]);

  return {
    whatsappRoutines,
    refetch,
    handleWhatsappRoutineUpdate,
  };
}
