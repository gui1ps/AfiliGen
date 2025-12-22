import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  getOneWhatsappRoutine,
  addMessageToWhatsappRoutine,
  RoutineMessage,
} from '../../../../../../services/automations/routines/whatsapp/whatsapp-routines';

import {
  MessagesStack,
  CreateMessagePayload,
} from '../../../data-display/MessagesStack';

interface Props {
  routineId: number;
}

export function RoutineMessagesView({ routineId }: Props) {
  const [messages, setMessages] = useState<RoutineMessage[]>([]);

  const load = async () => {
    const routine = await getOneWhatsappRoutine(routineId);
    setMessages(routine?.messages ?? []);
  };

  useEffect(() => {
    load();
  }, [routineId]);

  const handleCreate = async (msg: CreateMessagePayload) => {
    try {
      await addMessageToWhatsappRoutine(routineId, {
        content: msg.text,
      });
      await load();
      toast.success('Mensagem adicionada');
    } catch {
      toast.error('Erro ao adicionar mensagem.');
    }
  };

  return <MessagesStack messages={messages} onCreateMessage={handleCreate} />;
}
