import React from 'react';
import { Box, styled, keyframes } from '@mui/material';

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const twinkle = keyframes`
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
  }
`;

const StyledBackground = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'radial-gradient(ellipse at bottom, #1a1b3a 0%, #0f0f1e 100%)',
  zIndex: -1,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `
      radial-gradient(2px 2px at 20px 30px, #8b5cf6, transparent),
      radial-gradient(2px 2px at 40px 70px, #06b6d4, transparent),
      radial-gradient(1px 1px at 90px 40px, #6366f1, transparent),
      radial-gradient(1px 1px at 130px 80px, #8b5cf6, transparent),
      radial-gradient(2px 2px at 160px 30px, #06b6d4, transparent)
    `,
    backgroundRepeat: 'repeat',
    backgroundSize: '200px 100px',
    animation: `${twinkle} 3s ease-in-out infinite`,
  },
}));

const FloatingPlanet = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  background: 'linear-gradient(45deg, #8b5cf6 30%, #6366f1 90%)',
  opacity: 0.1,
  animation: `${float} 6s ease-in-out infinite`,
  '&:nth-of-type(1)': {
    top: '10%',
    right: '10%',
    width: '80px',
    height: '80px',
    animationDelay: '0s',
  },
  '&:nth-of-type(2)': {
    bottom: '20%',
    left: '5%',
    width: '60px',
    height: '60px',
    animationDelay: '2s',
  },
  '&:nth-of-type(3)': {
    top: '50%',
    left: '80%',
    width: '40px',
    height: '40px',
    animationDelay: '4s',
  },
}));

export const SpaceBackground: React.FC = () => {
  return (
    <StyledBackground>
      <FloatingPlanet />
      <FloatingPlanet />
      <FloatingPlanet />
    </StyledBackground>
  );
};