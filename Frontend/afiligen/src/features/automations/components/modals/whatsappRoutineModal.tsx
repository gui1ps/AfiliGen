import {
  updateWhatsappRoutine,
  WhatsAppRoutine,
} from '../../../../services/automations/routines/whatsapp/whatsapp-routines';
import { BaseModal } from '../../../../components/modals/BaseModal';
import { useCallback, useEffect, useState } from 'react';
import WhtspContactsList from '../../../../components/common/WhtspContactsList';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';

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

  const updateRoutineContacts = useCallback(async () => {
    try {
      await updateWhatsappRoutine({ recipients: selectedContacts }, item.id);
      toast.success('Contatos atualizados com sucesso');
    } catch (error) {
      toast.error(`Erro ao atualizar contatos: ${JSON.stringify(error)}`);
    }
  }, []);

  const handleModalSave = useCallback(async () => {
    switch (type) {
      case 'routine_contacts':
        await updateRoutineContacts();
        break;
      default:
        return;
    }
  }, [type]);

  const renderModalTitle = useCallback(() => {
    switch (type) {
      case 'routine_contacts':
        return 'Contatos';
      default:
        return '';
    }
  }, [type]);

  const renderModalContent = useCallback(() => {
    switch (type) {
      case 'routine_contacts':
        return (
          <WhtspContactsList
            setContacts={(contacts) => {
              setSelectedContacts(contacts);
            }}
            selected={item?.recipients}
          />
        );
      default:
        return;
    }
  }, [type]);

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={renderModalTitle()}
      actions={
        <>
          <Button
            onClick={async () => {
              await handleModalSave();
              onClose();
            }}
            variant="contained"
            color="primary"
            disabled={selectedContacts.length === 0}
          >
            Salvar
          </Button>
        </>
      }
    >
      {renderModalContent()}
    </BaseModal>
  );
}
