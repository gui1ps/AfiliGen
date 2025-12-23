import { useMemo, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  IconButton,
  Popover,
} from '@mui/material';

import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import EmojiPicker from 'emoji-picker-react';

import { ExpandableMessage } from './ExpandableMessage';
import { RoutineMessage } from '../../../../services/automations/routines/whatsapp/whatsapp-routines';

export type CreateMessagePayload = {
  text: string;
  image?: File | null;
};

interface MessagesStackProps {
  messages: RoutineMessage[];
  onCreateMessage: (msg: CreateMessagePayload) => void;

  // NOVOS
  onDeleteMessage: (messageId: number) => void;
  onUpdateMessage: (messageId: number, content: string) => void;
}

export function MessagesStack({
  messages,
  onCreateMessage,
  onDeleteMessage,
  onUpdateMessage,
}: MessagesStackProps) {
  const [openCreate, setOpenCreate] = useState(false);
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const messagesSorted = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf(),
    );
  }, [messages]);

  const handleSave = () => {
    if (!text && !image) return;
    onCreateMessage({ text, image });
    setText('');
    setImage(null);
    setOpenCreate(false);
  };

  const startEdit = (msg: RoutineMessage) => {
    setEditingId(msg.id);
    setEditingText(msg.content ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const confirmEdit = () => {
    if (!editingId) return;
    onUpdateMessage(editingId, editingText);
    cancelEdit();
  };

  return (
    <Stack spacing={2}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenCreate(true)}
        sx={{ width: '100%' }}
      >
        Adicionar mensagem
      </Button>

      {openCreate && (
        <Card sx={{ mt: 1 }}>
          <CardContent>
            <Button component="label" variant="outlined" sx={{ width: '100%' }}>
              Carregar imagem
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  setImage(e.target.files ? e.target.files[0] : null)
                }
              />
            </Button>

            {image && (
              <Typography mt={1} variant="body2">
                📁 {image.name}
              </Typography>
            )}

            <Box mt={2}>
              <TextField
                fullWidth
                label="Mensagem"
                multiline
                value={text}
                onChange={(e) => setText(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                      <EmojiEmotionsIcon />
                    </IconButton>
                  ),
                }}
              />
            </Box>

            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <EmojiPicker
                onEmojiClick={(emoji) => setText((prev) => prev + emoji.emoji)}
              />
            </Popover>
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

      {messagesSorted.length === 0 ? (
        <Typography>Sem mensagens para exibir</Typography>
      ) : (
        messagesSorted.map((msg) => {
          const isEditing = editingId === msg.id;

          return (
            <Box
              key={msg.id}
              sx={{
                p: 1,
                border: '1px solid #ddd',
                borderRadius: 1,
                maxWidth: '100%',
                overflow: 'hidden',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                position: 'relative',
              }}
            >
              {/* AÇÕES NO TOPO DIREITO */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  zIndex: 2,
                  display: 'flex',
                  gap: 0.5,
                  backgroundColor: 'rgba(255,255,255,0.85)',
                  borderRadius: 1,
                }}
              >
                {!isEditing ? (
                  <>
                    <IconButton
                      size="small"
                      aria-label="Editar mensagem"
                      onClick={() => startEdit(msg)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Remover mensagem"
                      onClick={() => onDeleteMessage(msg.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton
                      size="small"
                      aria-label="Cancelar edição"
                      onClick={cancelEdit}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Salvar edição"
                      onClick={confirmEdit}
                      disabled={editingText.trim().length === 0}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>

              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  label="Editar mensagem"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  sx={{ pr: 8 }}
                />
              ) : (
                <ExpandableMessage
                  text={msg.content ?? ''}
                  collapsedMaxLines={2}
                />
              )}
            </Box>
          );
        })
      )}
    </Stack>
  );
}
