import { Typography } from '@mui/material';
import Divider from '@mui/material/Divider';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <>
      <Typography variant={'h1'} marginBottom={2}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant={'subtitle1'} marginBottom={2}>
          {subtitle}
        </Typography>
      )}
      <Divider sx={{ marginBottom: 2 }} />
    </>
  );
}
