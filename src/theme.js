import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#e10600',
      light: '#ff1e00',
      dark: '#a00500',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffd700',
      light: '#ffed4e',
      dark: '#c7a600',
      contrastText: '#000000',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#999999',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '0.5px',
    },
    h2: {
      fontSize: '1.3rem',
      fontWeight: 700,
      letterSpacing: '0.5px',
    },
    body1: {
      fontSize: '0.95rem',
    },
    body2: {
      fontSize: '0.85rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#333',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: '#e10600',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#e10600',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        },
      },
    },
  },
});

export default theme;
