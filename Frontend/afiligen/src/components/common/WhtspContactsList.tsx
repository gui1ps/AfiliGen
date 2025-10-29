import { useWhatsapp } from '../../features/integrations/hooks/useWhatsapp';
import { Box } from '@mui/material';
import { WhatsAppContact } from '../../services/integrations/whatsapp';
import { useCallback, ReactNode, useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';

interface WhtspContactsListProps {
  setContacts: (contacts: string[]) => void;
  selected?: string[];
}

interface NoContactsStateProps {
  status: string;
}

function LoadingState() {
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

function NoContactsState({ status }: NoContactsStateProps) {
  if (status !== 'CONNECTED') {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Typography color="text.secondary" align="center">
          Sem conexão ao WhatsApp.
        </Typography>
        <Button variant="outlined" sx={{ width: '100%' }} href="/integrations">
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

function ContactsTable({
  contacts,
  onRowSelectionChange,
  selected,
}: {
  contacts: WhatsAppContact[];
  onRowSelectionChange: (selectedContacts: string[]) => void;
  selected?: string[];
}) {
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 150 },
    { field: 'number', headerName: 'Número', flex: 1, minWidth: 150 },
  ];

  const rows = contacts.map((c) => ({
    id: c.id._serialized,
    name: c.name || c.pushname || c.shortName || '(sem nome)',
    number: c.number,
  }));

  const [selectedContacts, setSelectedContacts] = useState<string[]>(
    selected || [],
  );

  const getSelectionModel = useCallback((): GridRowSelectionModel => {
    return {
      type: 'include',
      ids: new Set(selectedContacts),
    };
  }, [selectedContacts]);

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        disableRowSelectionExcludeModel
        rowSelectionModel={getSelectionModel()}
        onRowSelectionModelChange={(newSelection) => {
          const contactsArray = Array.from(newSelection.ids) as string[];
          setSelectedContacts(contactsArray);
          onRowSelectionChange(contactsArray);
        }}
        pageSizeOptions={[]}
        initialState={{
          pagination: { paginationModel: { pageSize: 6, page: 0 } },
        }}
      />
    </Box>
  );
}

export default function WhtspContactsList({
  setContacts,
  selected,
}: WhtspContactsListProps) {
  const { isLoading, contacts, status } = useWhatsapp();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  useEffect(() => {
    setContacts(selectedContacts);
  }, [selectedContacts]);

  const handleRowSelectionChange = useCallback(
    (newSelection: string[]) => {
      setSelectedContacts(newSelection);
    },
    [setContacts],
  );

  const renderWhatsappContacts = useCallback(() => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (!contacts || contacts.length === 0) {
      return <NoContactsState status={''} />;
    }

    return (
      <ContactsTable
        contacts={contacts}
        onRowSelectionChange={handleRowSelectionChange}
        selected={selected}
      />
    );
  }, [contacts, isLoading, status, handleRowSelectionChange]);

  return <Box>{renderWhatsappContacts()}</Box>;
}
