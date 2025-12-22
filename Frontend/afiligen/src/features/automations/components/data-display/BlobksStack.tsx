import { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';

import { Block } from '../../../../services/automations/routines/whatsapp/whatsapp-routines';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface BlocksStackProps {
  blocks: Block[];
  onCreateBlock: (block: { triggerTime: string }) => void;
}

export function BlocksStack({ blocks, onCreateBlock }: BlocksStackProps) {
  const [openCreate, setOpenCreate] = useState(false);
  const [triggerTime, setTriggerTime] = useState('');

  const handleSave = () => {
    if (!triggerTime) return;
    onCreateBlock({ triggerTime });
    setTriggerTime('');
    setOpenCreate(false);
  };

  return (
    <Stack spacing={2}>
      <Button
        variant="contained"
        onClick={() => setOpenCreate(true)}
        sx={{ width: '100%' }}
      >
        Adicionar bloco
      </Button>

      {openCreate && (
        <Card sx={{ mt: 1 }}>
          <CardContent>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label={'Horário de disparo'}
                onChange={(time) => setTriggerTime(time?.toISOString() || '')}
              />
            </LocalizationProvider>
          </CardContent>

          <CardActions>
            <Button variant="outlined" onClick={() => setOpenCreate(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Salvar
            </Button>
          </CardActions>
        </Card>
      )}

      {blocks.length === 0 ? (
        <Typography>Sem blocos para exibir</Typography>
      ) : (
        blocks.map((b) => (
          <Box
            key={b.id}
            sx={{
              p: 1,
              border: '1px solid #ddd',
              borderRadius: 1,
            }}
          >
            <Typography>⏰ {dayjs(b.triggerTime).format('HH:mm')}</Typography>
          </Box>
        ))
      )}
    </Stack>
  );
}
