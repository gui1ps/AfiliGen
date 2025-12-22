import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { WhatsAppContact } from '../../../../services/integrations/whatsapp';

type Props = {
  contacts?: WhatsAppContact[];
  isLoading?: boolean;
  status?: string | null;
  selected: string[];
  onChangeSelected: (ids: string[]) => void;
};

export function StepChooseContacts({
  contacts,
  isLoading,
  status,
  selected,
  onChangeSelected,
}: Props) {
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
    if (status !== 'CONNECTED') {
      return (
        <Box display="flex" flexDirection="column" gap={2} alignItems="center">
          <Typography color="text.secondary" align="center">
            Sem conexão ao WhatsApp.
          </Typography>
          <Button
            variant="outlined"
            sx={{ width: '100%' }}
            href="/integrations"
          >
            Integrações
          </Button>
        </Box>
      );
    }
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

  const rows = contacts.map((c) => ({
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
          const contactsArray = Array.from((newSelection as any).ids);
          onChangeSelected(contactsArray as string[]);
        }}
        pageSizeOptions={[]}
        initialState={{
          pagination: { paginationModel: { pageSize: 6, page: 0 } },
        }}
      />
    </Box>
  );
}
