import Integration from '../../integrations/interfaces/Integration';
import { WhatsApp } from '@mui/icons-material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
import { TextField } from '@mui/material';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';

const integrations: Integration[] = [
  { name: 'WhatsApp', logo: <WhatsApp fontSize="large" /> },
];

export default function useAutomationsForm() {
  const theme = useTheme();
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);

  const getRoutineCreationSteps = () => {
    const steps = [
      {
        title: 'Escolher Canal',
        content: (
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
          >
            {integrations.map((item, index) => {
              const isSelected = index === selectedChannel;
              return (
                <Grid key={index} size={{ xs: 12, sm: 12, md: 3 }}>
                  <Paper
                    onClick={() => {
                      setSelectedChannel(index);
                    }}
                    elevation={2}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 1,
                      minHeight: '150px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#F46829' : 'inherit',
                      color: isSelected
                        ? theme.palette.primary.contrastText
                        : 'inherit',
                    }}
                  >
                    {item.logo}
                    <Typography marginTop={1}>{item.name}</Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        ),
      },
      {
        title: 'Configurar Ação',
        content: <TextField fullWidth label="Tipo de ação" />,
      },
      {
        title: 'Agendamento',
        content: <TextField fullWidth label="Horário" />,
      },
      {
        title: 'Revisão',
        content: <div>Resumo final da rotina...</div>,
      },
    ];

    return steps;
  };
  return { getRoutineCreationSteps };
}
