import { useState } from 'react';
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
import EmojiPicker from 'emoji-picker-react';
import DeleteIcon from '@mui/icons-material/Delete';

import { RoutineMessage } from '../../../../services/automations/routines/whatsapp/whatsapp-routines';

interface MessagesStackProps {
  messages: RoutineMessage[];
  onCreateMessage: (msg: { text: string; image?: File | null }) => void;
}

export function MessagesStack({
  messages,
  onCreateMessage,
}: MessagesStackProps) {
  const [openCreate, setOpenCreate] = useState(false);
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleSave = () => {
    if (!text && !image) return;
    onCreateMessage({ text, image });
    setText('');
    setImage(null);
    setOpenCreate(false);
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

      {messages.length === 0 ? (
        <Typography>Sem mensagens para exibir</Typography>
      ) : (
        messages.map((msg) => (
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
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                zIndex: 2,
                backgroundColor: 'rgba(255,255,255,0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,1)',
                },
              }}
              onClick={() => {
                console.log('delete message', msg.id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>

            {msg.mediaPath && (
              <Box
                component="img"
                src={msg.mediaPath}
                alt=""
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  mb: 1,
                  borderRadius: 1,
                }}
              />
            )}

            <Typography
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {msg.content}
            </Typography>
          </Box>
        ))
      )}
    </Stack>
  );
}
