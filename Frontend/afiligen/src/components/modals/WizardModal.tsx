import * as React from 'react';
import {
  Box,
  Button,
  MobileStepper,
  useTheme,
  Typography,
  Stack,
} from '@mui/material';
import { BaseModal, BaseModalProps } from './BaseModal';

export type WizardStep = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  content: React.ReactNode;
  onNext?: () => Promise<void> | void;
  onBack?: () => void;
};

export type WizardModalProps = Omit<
  BaseModalProps,
  'children' | 'actions' | 'title' | 'subtitle'
> & {
  steps: WizardStep[];
  initialStep?: number;
  onFinish?: () => void;
  nextLabel?: string;
  backLabel?: string;
  finishLabel?: string;
};

export const WizardModal: React.FC<WizardModalProps> = ({
  open,
  onClose,
  steps,
  initialStep = 0,
  onFinish,
  nextLabel = 'Avançar',
  backLabel = 'Voltar',
  finishLabel = 'Concluir',
  ...baseProps
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(initialStep);
  const totalSteps = steps.length;
  const current = steps[activeStep];

  const handleNext = async () => {
    if (current.onNext) await current.onNext();
    if (activeStep < totalSteps - 1) {
      setActiveStep((s) => s + 1);
    } else {
      onFinish?.();
      onClose();
    }
  };

  const handleBack = () => {
    current.onBack?.();
    if (activeStep > 0) setActiveStep((s) => s - 1);
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={current.title}
      subtitle={current.subtitle}
      {...baseProps}
      actions={
        <>
          {activeStep > 0 && (
            <Button onClick={handleBack} color="inherit" variant="outlined">
              {backLabel}
            </Button>
          )}
          <Button onClick={handleNext} variant="contained" color="primary">
            {activeStep === totalSteps - 1 ? finishLabel : nextLabel}
          </Button>
        </>
      }
    >
      <Box>{current.content}</Box>

      <Stack alignItems="center" mt={3}>
        <MobileStepper
          variant="dots"
          steps={totalSteps}
          position="static"
          activeStep={activeStep}
          nextButton={null}
          backButton={null}
          sx={{
            background: 'transparent',
            '& .MuiMobileStepper-dot': {
              backgroundColor: theme.palette.grey[300],
            },
            '& .MuiMobileStepper-dotActive': {
              backgroundColor: theme.palette.primary.main,
            },
          }}
        />
        <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
          Passo {activeStep + 1} de {totalSteps}
        </Typography>
      </Stack>
    </BaseModal>
  );
};
