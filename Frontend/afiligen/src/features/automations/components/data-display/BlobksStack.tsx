import { useMemo, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { Block } from '../../../../services/automations/routines/whatsapp/whatsapp-routines';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface BlocksStackProps {
  blocks: Block[];
  onCreateBlock: (block: { triggerTime: string }) => void;
  onDeleteBlock: (blockId: number) => void;
  onUpdateBlockTime: (blockId: number, triggerTime: string) => void;
}

export function BlocksStack({
  blocks,
  onCreateBlock,
  onDeleteBlock,
  onUpdateBlockTime,
}: BlocksStackProps) {
  const [openCreate, setOpenCreate] = useState(false);
  const [triggerTime, setTriggerTime] = useState('');

  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [editingTime, setEditingTime] = useState<Dayjs | null>(null);

  const blocksSorted = useMemo(() => {
    return [...blocks].sort((a, b) => {
      const ta = dayjs(a.triggerTime).valueOf();
      const tb = dayjs(b.triggerTime).valueOf();
      return ta - tb;
    });
  }, [blocks]);

  const handleSaveCreate = () => {
    if (!triggerTime) return;
    onCreateBlock({ triggerTime });
    setTriggerTime('');
    setOpenCreate(false);
  };

  const startEdit = (b: Block) => {
    setEditingBlockId(b.id);
    setEditingTime(dayjs(b.triggerTime));
  };

  const cancelEdit = () => {
    setEditingBlockId(null);
    setEditingTime(null);
  };

  const confirmEdit = () => {
    if (!editingBlockId || !editingTime) return;

    onUpdateBlockTime(editingBlockId, editingTime.toISOString());
    cancelEdit();
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
                label="Horário de disparo"
                onChange={(time) => setTriggerTime(time?.toISOString() || '')}
              />
            </LocalizationProvider>
          </CardContent>

          <CardActions>
            <Button variant="outlined" onClick={() => setOpenCreate(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSaveCreate}>
              Salvar
            </Button>
          </CardActions>
        </Card>
      )}

      {blocksSorted.length === 0 ? (
        <Typography>Sem blocos para exibir</Typography>
      ) : (
        blocksSorted.map((b) => {
          const isEditing = editingBlockId === b.id;

          return (
            <Box
              key={b.id}
              sx={{
                p: 1,
                border: '1px solid #ddd',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                {!isEditing ? (
                  <Typography>
                    ⏰ {dayjs(b.triggerTime).format('HH:mm')}
                  </Typography>
                ) : (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="Novo horário"
                      value={editingTime}
                      onChange={(t) => setEditingTime(t)}
                      slotProps={{ textField: { size: 'small' } }}
                    />
                  </LocalizationProvider>
                )}
              </Box>

              {!isEditing ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    aria-label="Editar horário"
                    onClick={() => startEdit(b)}
                    size="small"
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    aria-label="Remover bloco"
                    onClick={() => onDeleteBlock(b.id)}
                    size="small"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    aria-label="Cancelar edição"
                    onClick={cancelEdit}
                    size="small"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    aria-label="Salvar novo horário"
                    onClick={confirmEdit}
                    size="small"
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          );
        })
      )}
    </Stack>
  );
}
