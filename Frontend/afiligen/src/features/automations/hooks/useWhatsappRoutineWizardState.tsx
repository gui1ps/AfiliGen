import { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';

export type WhatsappRoutineFormData = {
  name: string;
  intervalSeconds: number;
  startAt: string | null;
  endAt: string | null;
  recipients: string[];
  maxMessagesPerBlock: number;
};

export function useWhatsappRoutineWizardState() {
  const minStartDate = useMemo(() => dayjs().add(5, 'minute'), []);
  const minEndDate = useMemo(
    () => minStartDate.add(5, 'minute'),
    [minStartDate],
  );

  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);

  const [formData, setFormData] = useState<WhatsappRoutineFormData>({
    name: '',
    intervalSeconds: 0,
    startAt: null,
    endAt: null,
    recipients: [],
    maxMessagesPerBlock: 1,
  });

  const setField = useCallback(
    <K extends keyof WhatsappRoutineFormData>(
      key: K,
      value: WhatsappRoutineFormData[K],
    ) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => {
    setSelectedChannel(null);
    setFormData({
      name: '',
      intervalSeconds: 0,
      startAt: null,
      endAt: null,
      recipients: [],
      maxMessagesPerBlock: 1,
    });
  }, []);

  const isStepValid = useCallback(
    (stepIndex: number): boolean => {
      switch (stepIndex) {
        case 0:
          return selectedChannel !== null;

        case 1: {
          const hasBasics =
            formData.name.trim().length > 0 &&
            formData.intervalSeconds > 0 &&
            formData.startAt !== null &&
            formData.maxMessagesPerBlock > 0;

          const endOk =
            formData.endAt === null ||
            (formData.startAt !== null &&
              dayjs(formData.endAt).isAfter(dayjs(formData.startAt)));

          return hasBasics && endOk;
        }

        case 2:
          return formData.recipients.length > 0;

        default:
          return false;
      }
    },
    [selectedChannel, formData],
  );

  return {
    selectedChannel,
    setSelectedChannel,
    formData,
    setField,
    reset,
    isStepValid,
    minStartDate,
    minEndDate,
  };
}
