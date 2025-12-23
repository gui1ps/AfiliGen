import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  getOneWhatsappRoutine,
  addMessageToWhatsappRoutine,
  removeWhatsappRoutineMessage,
  updateWhatsappRoutineMessage,
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
      await addMessageToWhatsappRoutine(routineId, { content: msg.text });
      await load();
      toast.success('Mensagem adicionada');
    } catch {
      toast.error('Erro ao adicionar mensagem.');
    }
  };

  const handleDelete = async (messageId: number) => {
    try {
      await removeWhatsappRoutineMessage(routineId, messageId);
      await load();
      toast.success('Mensagem removida!');
    } catch {
      toast.error('Erro ao remover mensagem.');
    }
  };

  const handleUpdate = async (messageId: number, content: string) => {
    try {
      await updateWhatsappRoutineMessage(routineId, messageId, { content });
      await load();
      toast.success('Mensagem atualizada!');
    } catch {
      toast.error('Erro ao atualizar mensagem.');
    }
  };

  return (
    <MessagesStack
      messages={messages}
      onCreateMessage={handleCreate}
      onDeleteMessage={handleDelete}
      onUpdateMessage={handleUpdate}
    />
  );
}
