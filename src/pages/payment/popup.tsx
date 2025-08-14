import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function PaymentPopup() {
  useEffect(() => {
    // This page is used by INICIS to handle popup payment flow
    // INICIS will inject its own content into this page
    console.log('INICIS popup page loaded');
  }, []);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <CircularProgress />
      <Typography mt={2}>결제 창을 준비하고 있습니다...</Typography>
    </Box>
  );
}