// BaseModal.tsx
import * as React from 'react';
import {
  Modal,
  Backdrop,
  Fade,
  IconButton,
  Box,
  Stack,
  Typography,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  ModalProps,
  BackdropProps,
  PaperProps,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export type BaseModalProps = {
  open: boolean;
  onClose: () => void;

  title?: React.ReactNode;
  subtitle?: React.ReactNode;

  children?: React.ReactNode;

  actions?: React.ReactNode;

  hideCloseButton?: boolean;

  width?: number | string;
  maxWidth?: number | string;

  fullScreenAt?: 'xs' | 'sm' | 'md';

  allowCloseOnBackdrop?: boolean;

  keepMounted?: boolean;

  slotProps?: {
    modal?: Partial<ModalProps>;
    backdrop?: Partial<BackdropProps>;
    paper?: Partial<PaperProps>;
  };

  ariaLabelledById?: string;
  ariaDescribedById?: string;
};

export const BaseModal = React.forwardRef<HTMLDivElement, BaseModalProps>(
  (
    {
      open,
      onClose,
      title,
      subtitle,
      children,
      actions,
      hideCloseButton = false,
      width = 'min(90vw, 640px)',
      maxWidth,
      fullScreenAt = 'sm',
      allowCloseOnBackdrop = true,
      keepMounted = false,
      slotProps,
      ariaLabelledById,
      ariaDescribedById,
    },
    ref,
  ) => {
    const theme = useTheme();
    const isFullScreen = useMediaQuery(theme.breakpoints.down(fullScreenAt));

    const handleClose = (
      _: unknown,
      reason?: 'backdropClick' | 'escapeKeyDown',
    ) => {
      if (reason === 'backdropClick' && !allowCloseOnBackdrop) return;
      onClose();
    };

    const labelledId =
      ariaLabelledById || (title ? 'base-modal-title' : undefined);
    const describedId =
      ariaDescribedById || (subtitle ? 'base-modal-subtitle' : undefined);

    return (
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition={!keepMounted}
        keepMounted={keepMounted}
        aria-labelledby={labelledId}
        aria-describedby={describedId}
        slotProps={{
          backdrop: {
            timeout: 200,
            ...slotProps?.backdrop,
            sx: {
              backdropFilter: 'blur(4px)',
              backgroundColor: 'rgba(14, 17, 22, 0.55)',
              ...slotProps?.backdrop?.sx,
            },
          },
        }}
        {...slotProps?.modal}
      >
        <Fade in={open} timeout={200}>
          <Box
            ref={ref}
            role="dialog"
            aria-modal="true"
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              p: isFullScreen ? 0 : 2,
              outline: 'none',
            }}
          >
            <Paper
              elevation={24}
              {...slotProps?.paper}
              sx={{
                bgcolor: '#fbfbfb',
                color: 'text.primary',
                borderRadius: isFullScreen ? 0 : 3,
                width: isFullScreen ? '100vw' : width,
                maxWidth: isFullScreen ? '100vw' : maxWidth,
                maxHeight: isFullScreen ? '100vh' : '85vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow:
                  '0 10px 30px rgba(0,0,0,0.18), 0 6px 12px rgba(0,0,0,0.08)', // sombra moderna
                ...slotProps?.paper?.sx,
              }}
            >
              {(title || !hideCloseButton) && (
                <>
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    spacing={2}
                    sx={{
                      px: { xs: 2, sm: 3 },
                      pt: { xs: 2, sm: 3 },
                      pb: subtitle ? 1 : 2,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {title && (
                        <Typography
                          id={labelledId}
                          variant="h6"
                          fontWeight={700}
                          sx={{ lineHeight: 1.25 }}
                        >
                          {title}
                        </Typography>
                      )}
                      {subtitle && (
                        <Typography
                          id={describedId}
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.75 }}
                        >
                          {subtitle}
                        </Typography>
                      )}
                    </Box>
                    {!hideCloseButton && (
                      <IconButton
                        aria-label="Fechar modal"
                        onClick={onClose}
                        edge="end"
                        size="small"
                        sx={{
                          alignSelf: 'flex-start',
                          '&:hover': { backgroundColor: 'action.hover' },
                        }}
                      >
                        <CloseRoundedIcon />
                      </IconButton>
                    )}
                  </Stack>
                  <Divider sx={{ mx: { xs: 2, sm: 3 }, mt: 2 }} />
                </>
              )}

              <Box
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 2,
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  flex: 1,
                }}
              >
                {children}
              </Box>

              {actions && (
                <>
                  <Divider sx={{ mx: { xs: 2, sm: 3 } }} />
                  <Box
                    sx={{
                      px: { xs: 2, sm: 3 },
                      py: 2,
                      display: 'flex',
                      gap: 1.5,
                      justifyContent: 'flex-end',
                      position: 'sticky',
                      bottom: 0,
                      bgcolor: '#fbfbfb',
                    }}
                  >
                    {actions}
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        </Fade>
      </Modal>
    );
  },
);

BaseModal.displayName = 'BaseModal';
