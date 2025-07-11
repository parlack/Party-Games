import { createTheme } from '@mui/material/styles';

export const spaceTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      light: '#8b5cf6', // Purple
      dark: '#4f46e5',
    },
    secondary: {
      main: '#06b6d4', // Cyan
      light: '#22d3ee',
      dark: '#0891b2',
    },
    background: {
      default: '#0f0f1e',
      paper: '#1a1b3a',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#e2e8f0',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#cbd5e1',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#e2e8f0',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#cbd5e1',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.4)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #06b6d4 30%, #22d3ee 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #0891b2 30%, #06b6d4 90%)',
            boxShadow: '0 8px 30px 0 rgba(6, 182, 212, 0.6)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(99, 102, 241, 0.6)',
          color: '#8b5cf6',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          '&:hover': {
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            color: '#a78bfa',
          },
        },
        outlinedSecondary: {
          borderColor: 'rgba(239, 68, 68, 0.6)',
          color: '#f87171',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          '&:hover': {
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, rgba(26, 27, 58, 0.8) 0%, rgba(45, 27, 105, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 20px 60px 0 rgba(99, 102, 241, 0.3)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            '&::before': {
              opacity: 1,
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(99, 102, 241, 0.3)',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(99, 102, 241, 0.5)',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6366f1',
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.95) 0%, rgba(26, 27, 58, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
        colorPrimary: {
          background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
          color: 'white',
          boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
        },
        colorSecondary: {
          background: 'linear-gradient(45deg, #06b6d4 30%, #22d3ee 90%)',
          color: 'white',
          boxShadow: '0 4px 14px 0 rgba(6, 182, 212, 0.3)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
        },
        standardInfo: {
          backgroundColor: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: '#22d3ee',
        },
        standardError: {
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'linear-gradient(135deg, rgba(26, 27, 58, 0.95) 0%, rgba(45, 27, 105, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 20px 60px 0 rgba(99, 102, 241, 0.2)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        },
        bar: {
          borderRadius: '4px',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
            animation: 'shimmer 2s infinite',
          },
        },
      },
    },
  },
});