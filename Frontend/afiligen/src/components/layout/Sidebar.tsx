import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const iconsMap = new Map<string, React.ReactNode>([
  ['Principal', <HomeIcon />],
  ['Integrações', <IntegrationInstructionsIcon />],
  ['Automações', <ElectricBoltIcon />],
]);

const urlMap = new Map<string, string>([
  ['Principal', '/home'],
  ['Integrações', '/integrations'],
  ['Automações', '/automations'],
]);

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const theme = useTheme();
  const drawerWidth = 240;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const headerHeight = isMobile ? 56 : 64;
  const location = useLocation();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  const [selectedIndex, setSelectedIndex] = useState(() => {
    const path = location.pathname;
    const index = Array.from(urlMap.values()).findIndex((url) => url === path);
    return index >= 0 ? index : 0;
  });

  const toggleDrawer = () => setOpen(!open);

  return (
    <Drawer
      elevation={0}
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={isMobile ? toggleDrawer : undefined}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: isMobile ? '100%' : drawerWidth,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        '& .MuiDrawer-paper': {
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          width: isMobile ? '100%' : drawerWidth,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          transition: theme.transitions.create(['width', 'border-radius'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1.5,
          height: headerHeight,
        }}
      >
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={toggleDrawer}
            sx={{
              backgroundColor: theme.palette.primary.dark,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              },
              transition: 'transform 0.3s ease',
            }}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        )}
      </Box>

      <List sx={{ flexGrow: 1 }}>
        {['Principal', 'Integrações', 'Automações'].map((text, index) => (
          <ListItem key={text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
              href={urlMap.get(text) || ''}
              sx={{
                minHeight: 48,
                justifyContent: 'initial',
                px: 2.5,
                color: 'inherit',
                position: 'relative',
                opacity: selectedIndex === index ? 1 : 0.6,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.35)',
                },
                '&.Mui-selected::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  borderRadius: '0 4px 4px 0',
                  backgroundColor: theme.palette.secondary.main,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 3,
                  justifyContent: 'center',
                  color: 'inherit',
                }}
              >
                {iconsMap.get(text) || <></>}
              </ListItemIcon>
              <ListItemText
                primary={text}
                sx={{
                  opacity: 1,
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1.5,
          height: headerHeight,
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <ListItem disablePadding sx={{ width: '100%' }}>
          <ListItemButton
            onClick={() => {
              const logout = handleLogout();
              if (logout.success) navigate('/');
            }}
            sx={{
              justifyContent: 'initial',
              px: 2.5,
              color: 'inherit',
              opacity: 0.8,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 3,
                justifyContent: 'center',
                color: 'inherit',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Sair"
              sx={{
                opacity: 1,
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Drawer>
  );
}
