import { PropsWithChildren, useState } from 'react';
import {
  Box,
  ThemeProvider,
  CssBaseline,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { theme } from '../../theme';
import Sidebar from './Sidebar';
import MenuIcon from '@mui/icons-material/Menu';

export default function BaseLayout({ children }: PropsWithChildren) {
  const [open, setOpen] = useState<boolean>(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const drawerWidth = 240;

  const toggleDrawer = () => setOpen(!open);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          display: 'flex',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Sidebar open={open} setOpen={setOpen} />

        {isMobile && !open && (
          <IconButton
            onClick={toggleDrawer}
            color="inherit"
            aria-label="abrir menu"
            sx={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: (theme) => theme.zIndex.drawer + 1,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              boxShadow: 3,
              transition: 'transform 0.2s ease',
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: '100vh',
            bgcolor: theme.palette.primary.main,
            p: isMobile ? 0 : (theme) => theme.spacing(1, 1, 1, 0),
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              maxHeight: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              backgroundColor: theme.palette.background.paper,
              borderRadius: isMobile ? 0 : 6,
              p: 4,
              boxSizing: 'border-box',
              transition: (theme) =>
                theme.transitions.create(['width', 'border-radius'], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
