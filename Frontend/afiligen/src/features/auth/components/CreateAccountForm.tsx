import { Box, Button, TextField } from "@mui/material";

import { useForm } from "react-hook-form";

import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function  CreateAccountForm(){

    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();

    return(
        <Box
        component={'form'}
        onSubmit={handleSubmit(()=>{})}
        sx={{width:'100%', display: 'flex', flexDirection: 'column', gap:5}}
        >
            <TextField label="E-mail" type="email" focused={true}  {...register('email', { required: true })} />
            <TextField label="Senha" type={'password'} focused={true} {...register('password', { required: true })} />
            <TextField label="Confirmar senha" type={'password'} focused={true} {...register('confirm-password', { required: true })} />
            <Button variant="contained" type="submit" sx={{width:'100%'}}>Criar</Button>
        </Box>
    )
}

export default CreateAccountForm