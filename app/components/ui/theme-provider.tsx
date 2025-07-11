import React from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { spaceTheme } from '../../styles/spacetheme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <MuiThemeProvider theme={spaceTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}; 