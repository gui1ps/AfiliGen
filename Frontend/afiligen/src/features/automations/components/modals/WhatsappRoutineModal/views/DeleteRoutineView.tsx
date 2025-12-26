import { Typography } from '@mui/material';
import { Stack, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { deleteWhatsappRoutine } from '../../../../../../services/automations/routines/whatsapp/whatsapp-routines';

interface props {
  routineId: number;
  routineName: string;
  onClose: () => void;
  onSave: () => void;
}

export function DeleteRoutineView({
  routineId,
  routineName,
  onClose,
  onSave,
}: props) {
  const handleSave = async () => {
    try {
      await deleteWhatsappRoutine(routineId);

      toast.success('Rotina deletada!');
      onSave();
    } catch {
      toast.error('Erro ao deletar rotina.');
    }
  };
  return (
    <Stack spacing={2} alignItems={'center'}>
      <Typography fontSize={18}>
        Você deseja deletar a rotina{' '}
        <Typography fontWeight={700} display={'inline-block'}>
          {routineName}
        </Typography>
        ?
      </Typography>
      <Button variant="outlined" fullWidth size="small" onClick={handleSave}>
        Sim
      </Button>
      <Button variant="contained" fullWidth size="small" onClick={onClose}>
        Não
      </Button>
    </Stack>
  );
}
