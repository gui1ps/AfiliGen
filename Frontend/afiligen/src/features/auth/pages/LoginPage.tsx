import { ThemeProvider, Box, Typography, Link } from "@mui/material"
import { theme } from "../../../theme"
import LoginForm from "../components/LoginForm"

function LoginPage(){
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
            flexDirection={"column"}
            justifyContent="center"
            alignItems="center"
            gap={10}
            width={460}
            >
                <Typography variant="h1">Bom Ter Você Aqui</Typography>
                <LoginForm/>
                <Typography variant="subtitle1">Ainda não tem uma conta?<Link href="/create-account">Criar</Link></Typography>
            </Box>
        </Box>
    </ThemeProvider>
    )
}

export default LoginPage