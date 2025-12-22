import { useState } from 'react';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';

import WhtspContactsList from '../../../../../../components/common/WhtspContactsList';
import {
  WhatsAppRoutine,
  updateWhatsappRoutine,
} from '../../../../../../services/automations/routines/whatsapp/whatsapp-routines';

interface Props {
  routine: WhatsAppRoutine;
  onSaved: () => void;
}

export function RoutineContactsView({ routine, onSaved }: Props) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>(
    routine.recipients ?? [],
  );
  const canSave = selectedContacts.length > 0;

  const handleSave = async () => {
    try {
      await updateWhatsappRoutine({ recipients: selectedContacts }, routine.id);
      toast.success('Contatos atualizados com sucesso');
      onSaved();
    } catch (error: any) {
      toast.error(
        `Erro ao atualizar contatos: ${error?.message ?? 'desconhecido'}`,
      );
    }
  };

  return (
    <>
      <WhtspContactsList
        key={routine.id}
        selected={selectedContacts}
        setContacts={setSelectedContacts}
      />

      <Button
        fullWidth
        variant="contained"
        onClick={handleSave}
        disabled={!canSave}
        sx={{ mt: 2 }}
      >
        Salvar
      </Button>
    </>
  );
}
