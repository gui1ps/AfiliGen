import {
  getOneWhatsappRoutine,
  RoutineMessage,
  updateWhatsappRoutine,
  WhatsAppRoutine,
  addMessageToWhatsappRoutine,
  createBlock,
} from '../../../../services/automations/routines/whatsapp/whatsapp-routines';
import { BaseModal } from '../../../../components/modals/BaseModal';
import { useCallback, useEffect, useState } from 'react';
import WhtspContactsList from '../../../../components/common/WhtspContactsList';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { MessagesStack } from '../data-display/MessagesStack';
import { BlocksStack } from '../data-display/BlobksStack';
import { Block } from '../../../../services/automations/routines/whatsapp/whatsapp-routines';

export type WhatsAppModalType =
  | 'routines'
  | 'routine_message'
  | 'routine_block'
  | 'routine_edition'
  | 'routine_contacts';

interface WhatsappRoutineModalProps {
  type?: WhatsAppModalType;
  item: WhatsAppRoutine;
  open: boolean;
  onClose: () => void;
}

export default function WhatsappRoutineModal({
  type,
  item,
  open,
  onClose,
}: WhatsappRoutineModalProps) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [messages, setMessages] = useState<RoutineMessage[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  const queryClient = useQueryClient();

  const loadRoutineMessages = async () => {
    const routine = await getOneWhatsappRoutine(item.id);
    if (!routine) return;
    setMessages(routine.messages || []);
  };

  const loadRoutineBlocks = async () => {
    const routine = await getOneWhatsappRoutine(item.id);
    if (!routine) return;
    setBlocks(routine.chatAppMessageBlock || []);
  };

  useEffect(() => {
    const handleOpenState = async () => {
      if (open) {
        if (type === 'routine_contacts') {
          setSelectedContacts(item?.recipients ?? []);
        } else if (type === 'routine_message') {
          await loadRoutineMessages();
        } else if (type === 'routine_block') {
          await loadRoutineBlocks();
        } else {
          return;
        }
      }
    };

    handleOpenState();
  }, [open, type, item]);

  const updateRoutineContacts = useCallback(async () => {
    try {
      await updateWhatsappRoutine({ recipients: selectedContacts }, item.id);
      toast.success('Contatos atualizados com sucesso');
    } catch (error) {
      const msg =
        (error as any)?.message ??
        (typeof error === 'string' ? error : JSON.stringify(error));
      toast.error(`Erro ao atualizar contatos: ${msg}`);
      throw error;
    }
  }, [selectedContacts, item?.id]);

  const handleModalSave = useCallback(async () => {
    switch (type) {
      case 'routine_contacts':
        await updateRoutineContacts();
        queryClient.invalidateQueries({ queryKey: ['whatsappRoutines'] });
        break;
      default:
        return;
    }
  }, [type, updateRoutineContacts]);

  const renderModalTitle = useCallback(() => {
    switch (type) {
      case 'routine_contacts':
        return 'Contatos';
      case 'routine_message':
        return 'Mensagens';
      case 'routine_block':
        return 'Blocos de Mensagens';
      default:
        return '';
    }
  }, [type]);

  const renderModalContent = useCallback(() => {
    switch (type) {
      case 'routine_contacts':
        return (
          <WhtspContactsList
            key={item?.id}
            setContacts={(contacts) => setSelectedContacts(contacts)}
            selected={selectedContacts}
          />
        );
      case 'routine_message':
        return (
          <MessagesStack
            messages={messages}
            onCreateMessage={async (msg) => {
              try {
                await addMessageToWhatsappRoutine(item.id, {
                  content: msg.text,
                });
                await loadRoutineMessages();
                toast.success('Mensagem adicionada');
              } catch {
                toast.error('Erro ao adicionar mensagem, tente nvamente.');
              }
            }}
          />
        );
      case 'routine_block':
        return (
          <BlocksStack
            blocks={blocks}
            onCreateBlock={async (block) => {
              try {
                const data = { ...block, routineId: item.id };
                await createBlock(data);
                toast.success('Bloco criado!');
              } catch {
                toast.error('Erro ao criar bloco.');
              }
            }}
          />
        );
      default:
        return null;
    }
  }, [type, item, selectedContacts, messages]);

  const canSave =
    type === 'routine_contacts' ? selectedContacts.length > 0 : true;

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={renderModalTitle()}
      actions={
        <>
          {type === 'routine_contacts' && (
            <Button
              onClick={async () => {
                try {
                  await handleModalSave();
                  onClose();
                } catch {
                  /**/
                }
              }}
              variant="contained"
              color="primary"
              disabled={!canSave}
            >
              Salvar
            </Button>
          )}
        </>
      }
    >
      {renderModalContent()}
    </BaseModal>
  );
}
