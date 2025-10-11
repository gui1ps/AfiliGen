import { ThemeProvider, Box, Typography, Link } from '@mui/material';
import { theme } from '../../../theme';
import CreateAccountForm from '../components/CreateAccountForm';
function CreateAccountPage() {
  return (
    <ThemeProvider theme={theme}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Box
          display="flex"
          flexDirection={'column'}
          justifyContent="center"
          alignItems="center"
          gap={10}
          width={460}
        >
          <Typography variant="h1">Bom Ter Você Aqui</Typography>
          <CreateAccountForm />
          <Typography variant="subtitle1">
            Já tem uma conta?<Link href="/">Logar</Link>
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default CreateAccountPage;
