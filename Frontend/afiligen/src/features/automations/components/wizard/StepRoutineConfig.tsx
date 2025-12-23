import { Box, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { WhatsappRoutineFormData } from '../../hooks/useWhatsappRoutineWizardState';
import { Checkbox, FormControlLabel, InputAdornment } from '@mui/material';

type Props = {
  formData: WhatsappRoutineFormData;
  setField: <K extends keyof WhatsappRoutineFormData>(
    key: K,
    value: WhatsappRoutineFormData[K],
  ) => void;
  minStartDate: Dayjs;
  minEndDate: Dayjs;
  disableStartAt?: boolean;
};

export function StepRoutineConfig({
  formData,
  setField,
  minStartDate,
  minEndDate,
  disableStartAt,
}: Props) {
  const hasEndAt = Boolean(formData.endAt);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
        width: '100%',
      }}
    >
      <TextField
        fullWidth
        label="Título"
        value={formData.name}
        onChange={(e) => setField('name', e.target.value)}
        slotProps={{ htmlInput: { maxLength: 21 } }}
      />

      <TextField
        fullWidth
        label="Intervalo entre mensagens (minutos)"
        type="number"
        value={formData.intervalSeconds ? formData.intervalSeconds / 60 : ''}
        onChange={(e) =>
          setField('intervalSeconds', Number(e.target.value) * 60)
        }
        slotProps={{ htmlInput: { min: 1 } }}
      />

      <TextField
        fullWidth
        label="Máximo de mensagens por bloco"
        type="number"
        value={formData.maxMessagesPerBlock}
        onChange={(e) =>
          setField('maxMessagesPerBlock', Number(e.target.value))
        }
        slotProps={{ htmlInput: { min: 1 } }}
      />

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            width: '100%',
            alignItems: 'start',
          }}
        >
          <DateTimePicker
            label="Data inicial"
            value={formData.startAt ? dayjs(formData.startAt) : null}
            onChange={(v) => setField('startAt', v ? v.toISOString() : null)}
            minDateTime={minStartDate}
            disabled={disableStartAt}
            slotProps={{
              textField: disableStartAt
                ? { helperText: 'Já iniciada — não é possível editar' }
                : undefined,
            }}
          />
          <DateTimePicker
            label="Data final"
            value={formData.endAt ? dayjs(formData.endAt) : null}
            onChange={(v) => setField('endAt', v ? v.toISOString() : null)}
            minDateTime={minEndDate}
            disabled={!formData.endAt}
            slotProps={{
              textField: {
                helperText: formData.endAt
                  ? 'Opcional'
                  : 'Desmarcado: sem data final',
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Checkbox
                        size="small"
                        checked={Boolean(formData.endAt)}
                        onChange={(_, checked) => {
                          if (!checked) {
                            setField('endAt', null);
                          } else {
                            setField('endAt', minEndDate.toISOString());
                          }
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              },
            }}
          />
        </Box>
      </LocalizationProvider>
    </Box>
  );
}
