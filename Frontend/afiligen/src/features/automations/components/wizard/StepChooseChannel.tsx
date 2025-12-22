import { Grid, Paper, Typography } from '@mui/material';
import { Theme } from '@mui/material/styles';
import Integration from '../../../integrations/interfaces/Integration';

type Props = {
  theme: Theme;
  integrations: Integration[];
  selectedChannel: number | null;
  onSelect: (index: number | null) => void;
};

export function StepChooseChannel({
  theme,
  integrations,
  selectedChannel,
  onSelect,
}: Props) {
  return (
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
              onClick={() => onSelect(isSelected ? null : index)}
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
  );
}
