import React from 'react';
import { Box } from '@mui/material';
import { Header } from './header';
import { SpaceBackground } from '../ui/spacebackground';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <SpaceBackground />
      <Header />
      <Box sx={{ pt: 8, px: 2 }}>
        {children}
      </Box>
    </Box>
  );
};