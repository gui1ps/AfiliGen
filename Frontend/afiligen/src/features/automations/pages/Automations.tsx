import { Typography } from '@mui/material';
import BaseLayout from '../../../components/layout/BaseLayout';

export default function Automations() {
  return (
    <BaseLayout>
      <Typography variant={'h1'} marginBottom={1}>
        Automações
      </Typography>
      <Typography variant={'subtitle1'} marginBottom={1}>
        Crie e gerencie automações para enviar mensagens e posts
        automaticamente.
      </Typography>
    </BaseLayout>
  );
}
