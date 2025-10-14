import {
  Button,
  Box,
  TextField,
  LinearProgress,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { CreateAccount } from '../../../services/auth/create-account';
import { useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import zxcvbn from 'zxcvbn';

function CreateAccountForm() {
  const { register, handleSubmit } = useForm();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [confirmePassword, setConfirmePassword] = useState('');

  const [passwordMatch, setPasswordMatch] = useState<boolean>(false);

  const [score, setScore] = useState(0);

  const [confirmPasswordDisabled, setConfirmPasswordDisabled] =
    useState<boolean>(true);
  const navigate = useNavigate();
  const { loading, handleCreateAccount } = useAuth();

  const changePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordChange = (password: string) => {
    setPassword(password);
    setPasswordMatch(password === confirmePassword);
    const result = zxcvbn(password);
    setScore(result.score);
  };

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
        return 'Muito fraca';
      case 1:
        return 'Fraca';
      case 2:
        return 'Média';
      case 3:
        return 'Forte';
      case 4:
        return 'Muito forte';
      default:
        return '';
    }
  };

  const getProgressColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'error';
      case 2:
        return 'warning';
      case 3:
        return 'info';
      case 4:
        return 'success';
      default:
        return 'inherit';
    }
  };

  return (
    <Box
      component={'form'}
      onSubmit={handleSubmit(async (data) => {
        const signup = await handleCreateAccount(data as CreateAccount);
        if (signup.success) {
          navigate('/');
          toast.success(`${signup.message}`);
        } else {
          toast.error(`${signup.message}`);
        }
      })}
      sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}
    >
      <TextField
        label="Nome"
        type="text"
        focused={true}
        {...register('name', { required: true })}
      />
      <TextField
        label="E-mail"
        type="email"
        focused={true}
        {...register('email', { required: true })}
      />
      <TextField
        label="Senha"
        type={showPassword ? 'text' : 'password'}
        focused
        {...register('password', {
          required: true,
          onChange: (e) => {
            const trimmedValue = e.target.value.trim();
            setConfirmPasswordDisabled(trimmedValue.length === 0);
            handlePasswordChange(trimmedValue);
          },
        })}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {showPassword ? (
                  <VisibilityOffIcon
                    style={{ cursor: 'pointer', color: '#515151' }}
                    onClick={changePasswordVisibility}
                  />
                ) : (
                  <VisibilityIcon
                    style={{ cursor: 'pointer', color: '#515151' }}
                    onClick={changePasswordVisibility}
                  />
                )}
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        label="Confirmar senha"
        type={showPassword ? 'text' : 'password'}
        focused={true}
        disabled={confirmPasswordDisabled}
        color={passwordMatch ? 'primary' : 'error'}
        onChange={(e) => {
          const trimmedValue = e.target.value.trim();
          setPasswordMatch(trimmedValue === password);
          setConfirmePassword(trimmedValue);
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {showPassword ? (
                  <VisibilityOffIcon
                    style={{ cursor: 'pointer', color: '#515151' }}
                    onClick={changePasswordVisibility}
                  />
                ) : (
                  <VisibilityIcon
                    style={{ cursor: 'pointer', color: '#515151' }}
                    onClick={changePasswordVisibility}
                  />
                )}
              </InputAdornment>
            ),
          },
        }}
      />
      {password && (
        <>
          <LinearProgress
            variant="determinate"
            value={((score + 1) / 5) * 100}
            color={getProgressColor(score)}
            sx={{ mt: 1, height: 8, borderRadius: 2 }}
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Força da senha: <strong>{getStrengthLabel(score)}</strong>
          </Typography>
        </>
      )}
      <Button
        variant="contained"
        type="submit"
        sx={{ width: '100%' }}
        disabled={!passwordMatch || score < 3}
      >
        Criar
      </Button>
    </Box>
  );
}

export default CreateAccountForm;
