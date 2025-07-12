import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import QRCode from 'qrcode';

interface QRCodeComponentProps {
  value: string;
  size?: number;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  foregroundColor?: string;
}

export const QRCodeComponent: React.FC<QRCodeComponentProps> = ({
  value,
  size = 300,
  title,
  subtitle,
  backgroundColor = '#ffffff',
  foregroundColor = '#000000'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: foregroundColor,
          light: backgroundColor
        }
      }).catch(err => {
        console.error('Error generando QR:', err);
      });
    }
  }, [value, size, backgroundColor, foregroundColor]);

  if (!value) {
    return (
      <Box sx={{
        width: size,
        height: size,
        background: backgroundColor,
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)'
      }}>
        <Typography variant="body2" color="text.secondary">
          No hay enlace para mostrar
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      {title && (
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" sx={{ color: '#b3b3ff', mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      <Box sx={{
        display: 'inline-block',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.2)'
      }}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />
      </Box>
    </Box>
  );
};

export default QRCodeComponent; 