import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

import { WhatsappRoutineFormData } from '../../../../hooks/useWhatsappRoutineWizardState';

import {
  getOneWhatsappRoutine,
  updateWhatsappRoutine,
} from '../../../../../../services/automations/routines/whatsapp/whatsapp-routines';

import { StepRoutineConfig } from '../../../wizard/StepRoutineConfig';

type Props = {
  routineId: number;
  onSaved?: () => void;
};

export function RoutineEditionView({ routineId, onSaved }: Props) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<WhatsappRoutineFormData>({
    name: '',
    intervalSeconds: 60,
    maxMessagesPerBlock: 1,
    startAt: null,
    endAt: null,
    recipients: [],
  });

  const setField = <K extends keyof WhatsappRoutineFormData>(
    key: K,
    value: WhatsappRoutineFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const [originalStartAt, setOriginalStartAt] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const routine = await getOneWhatsappRoutine(routineId);
      setOriginalStartAt(routine.startAt);
      setFormData({
        name: routine.name,
        intervalSeconds: routine.intervalSeconds,
        maxMessagesPerBlock: routine.maxMessagesPerBlock,
        startAt: routine.startAt,
        endAt: routine.endAt,
        recipients: routine.recipients,
      });
    } catch {
      toast.error('Erro ao carregar rotina.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [routineId]);

  const nowMin = dayjs().second(0).millisecond(0);
  const minStartDate = nowMin;
  const minEndDate = nowMin;

  const canEditStartAt = useMemo(() => {
    if (!originalStartAt) return true;
    return dayjs(originalStartAt).isAfter(nowMin);
  }, [originalStartAt, nowMin]);

  const validate = () => {
    if (!formData.name || formData.name.trim().length === 0) {
      toast.error('Título é obrigatório.');
      return false;
    }

    if (!formData.intervalSeconds || formData.intervalSeconds < 60) {
      toast.error('Intervalo mínimo: 1 minuto.');
      return false;
    }

    if (!formData.maxMessagesPerBlock || formData.maxMessagesPerBlock < 1) {
      toast.error('Máximo de mensagens por bloco deve ser ≥ 1.');
      return false;
    }

    if (formData.startAt) {
      if (!canEditStartAt) {
        if (formData.startAt !== originalStartAt) {
          toast.error(
            'A data inicial já começou e não pode mais ser alterada.',
          );
          return false;
        }
      } else {
        const start = dayjs(formData.startAt);
        if (start.isBefore(nowMin)) {
          toast.error('Data inicial não pode estar no passado.');
          return false;
        }
      }
    }

    if (formData.endAt) {
      const end = dayjs(formData.endAt);
      if (end.isBefore(nowMin)) {
        toast.error('Data final não pode estar no passado.');
        return false;
      }
    }

    if (formData.startAt && formData.endAt) {
      if (dayjs(formData.endAt).isBefore(dayjs(formData.startAt))) {
        toast.error('Data final não pode ser anterior à data inicial.');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const payload: Partial<WhatsappRoutineFormData> = {
        name: formData.name,
        intervalSeconds: formData.intervalSeconds,
        maxMessagesPerBlock: formData.maxMessagesPerBlock,
        endAt: formData.endAt ?? null,
      };

      if (canEditStartAt) {
        payload.startAt = formData.startAt ?? null;
      }

      await updateWhatsappRoutine(payload, routineId);

      toast.success('Rotina atualizada!');
      onSaved?.();
    } catch {
      toast.error('Erro ao atualizar rotina.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <StepRoutineConfig
        formData={formData as any}
        setField={setField as any}
        minStartDate={minStartDate}
        minEndDate={minEndDate}
        disableStartAt={!canEditStartAt}
      />

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={load} disabled={loading}>
          Recarregar
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          Salvar
        </Button>
      </Box>
    </Stack>
  );
}
