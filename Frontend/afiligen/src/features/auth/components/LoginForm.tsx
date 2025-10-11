import { Box, Button, TextField } from "@mui/material";

import { useForm } from "react-hook-form";
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { LoginPayload } from "../../../services/auth/login";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function LoginForm(){

    const { register, handleSubmit } = useForm();
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const navigate = useNavigate();

    const {handleLogin,loading} = useLogin()
    
    const changePasswordVisibility = () =>{
        setShowPassword(!showPassword)
    }

    return(
        <Box
        component={'form'}
        onSubmit={handleSubmit(async (data)=>{
          const login = await handleLogin(data as LoginPayload)
          if(login.success){
            navigate('/dashboard')
            toast.success(`${login.message}`)
          }else{
            toast.error(`${login.message}`)
          }
        })}
        sx={{width:'100%', display: 'flex', flexDirection: 'column', gap:5}}
        >
            <TextField label="E-mail" type="email" focused={true}  {...register('email', { required: true })} />
            <TextField label="Senha" type={showPassword?'text':'password'} focused={true}  slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {showPassword ?<VisibilityOffIcon style={{cursor:'pointer',color:'#515151'}} onClick={changePasswordVisibility}/>:<VisibilityIcon style={{cursor:'pointer',color:'#515151'}} onClick={changePasswordVisibility}/>}
              </InputAdornment>
            ),
          },
        }} {...register('password', { required: true })} />
            <Button variant="contained" type="submit" sx={{width:'100%'}}>Continuar</Button>
        </Box>
    )
}

export default LoginForm