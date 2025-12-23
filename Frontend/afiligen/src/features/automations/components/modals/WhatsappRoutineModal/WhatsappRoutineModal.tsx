import { BaseModal } from '../../../../../components/modals/BaseModal';

import { WhatsAppRoutine } from '../../../../../services/automations/routines/whatsapp/whatsapp-routines';

import { RoutineContactsView } from './views/RoutineContactsView';
import { RoutineMessagesView } from './views/RoutineMessagesView';
import { RoutineBlocksView } from './views/RoutineBlocksView';
import { RoutineEditionView } from './views/RoutineEditionView';

export type WhatsAppModalType =
  | 'routines'
  | 'routine_message'
  | 'routine_block'
  | 'routine_edition'
  | 'routine_contacts';

interface Props {
  type?: WhatsAppModalType;
  item: WhatsAppRoutine;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function WhatsappRoutineModal({
  type,
  item,
  open,
  onClose,
  onSaved,
}: Props) {
  const titleMap: Record<WhatsAppModalType, string> = {
    routines: '',
    routine_contacts: 'Contatos',
    routine_message: 'Mensagens',
    routine_block: 'Blocos de Mensagens',
    routine_edition: 'Editar Rotina',
  };

  return (
    <BaseModal open={open} onClose={onClose} title={type ? titleMap[type] : ''}>
      {type === 'routine_contacts' && (
        <RoutineContactsView
          routine={item}
          onSaved={() => {
            onSaved?.();
            onClose();
          }}
        />
      )}

      {type === 'routine_message' && (
        <RoutineMessagesView routineId={item.id} />
      )}

      {type === 'routine_block' && <RoutineBlocksView routineId={item.id} />}

      {type === 'routine_edition' && (
        <RoutineEditionView
          routineId={item.id}
          onSaved={() => {
            onSaved?.();
            onClose();
          }}
        />
      )}
    </BaseModal>
  );
}
