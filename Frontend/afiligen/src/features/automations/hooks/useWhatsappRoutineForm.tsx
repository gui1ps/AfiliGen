import Integration from '../../integrations/interfaces/Integration';
import { WhatsApp } from '@mui/icons-material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Typography, TextField, Box, CircularProgress } from '@mui/material';
import { useState, useCallback, ReactNode, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { WizardStep } from '../../../components/modals/WizardModal';
import { useWhatsapp } from '../../integrations/hooks/useWhatsapp';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { WhatsAppContact } from '../../../services/integrations/whatsapp';

const integrations: Integration[] = [
  { name: 'WhatsApp', logo: <WhatsApp fontSize="large" /> },
];

export default function useAutomationsForm() {
  const theme = useTheme();
  const { isLoading, contacts, refetchContacts } = useWhatsapp();

  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    interval: '',
    startDate: null,
    endDate: null,
    selectedContacts: [] as WhatsAppContact[],
  });

  useEffect(() => {
    console.log(JSON.stringify(formData));
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderWhatsappBoxContent = useCallback(
    (contacts?: WhatsAppContact[], isLoading?: boolean): ReactNode => {
      if (isLoading) {
        return (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        );
      }

      if (!contacts || contacts.length === 0) {
        return (
          <Typography color="text.secondary" align="center">
            Nenhum contato encontrado.
          </Typography>
        );
      }

      const columns: GridColDef[] = [
        { field: 'name', headerName: 'Nome', flex: 1, minWidth: 150 },
        { field: 'number', headerName: 'Número', flex: 1, minWidth: 150 },
      ];

      const rows = contacts.map((c, i) => ({
        id: c.id._serialized,
        name: c.name || c.pushname || c.shortName || '(sem nome)',
        number: c.number,
      }));

      return (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            checkboxSelection
            disableRowSelectionExcludeModel
            onRowSelectionModelChange={(newSelection) => {
              console.log(newSelection);
              const contactsArray = Array.from(newSelection.ids);
              console.log(contactsArray);
              handleChange('selectedContacts', contactsArray);
            }}
            pageSizeOptions={[]}
            initialState={{
              pagination: { paginationModel: { pageSize: 6, page: 0 } },
            }}
          />
        </Box>
      );
    },
    [contacts, isLoading],
  );

  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return selectedChannel !== null;
      case 1:
        return (
          formData.title.trim().length > 0 &&
          Number(formData.interval) > 0 &&
          formData.startDate !== null
        );
      case 2:
        return formData.selectedContacts.length > 0;
      default:
        return false;
    }
  };

  const getRoutineCreationSteps = (): WizardStep[] => [
    {
      title: 'Escolher Canal',
      content: () => (
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
                  onClick={() => setSelectedChannel(isSelected ? null : index)}
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
      nextEnabled: () => !isStepValid(0),
    },
    {
      title: 'Realize as configurações',
      content: () => (
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
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
          <TextField
            fullWidth
            label="Intervalo entre mensagens (segundos)"
            type="number"
            value={formData.interval}
            onChange={(e) => handleChange('interval', e.target.value)}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                width: '100%',
              }}
            >
              <DatePicker
                label="Data inicial"
                value={formData.startDate}
                onChange={(newValue) => handleChange('startDate', newValue)}
              />
              <DatePicker
                label="Data final"
                value={formData.endDate}
                onChange={(newValue) => handleChange('endDate', newValue)}
                slotProps={{
                  textField: {
                    helperText: 'Opcional',
                  },
                }}
              />
            </Box>
          </LocalizationProvider>
        </Box>
      ),
      nextEnabled: () => !isStepValid(1),
    },
    {
      title: 'Escolha os contatos',
      content: () => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          {renderWhatsappBoxContent(contacts, isLoading)}
        </Box>
      ),
      nextEnabled: () => !isStepValid(2),
    },
  ];

  return {
    getRoutineCreationSteps,
    formData,
    isStepValid,
  };
}
