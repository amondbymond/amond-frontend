import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function MobileResult() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      const { 
        resultCode, 
        resultMsg, 
        tid, 
        authToken, 
        authUrl, 
        payMethod,
        mid,
        oid,
        amt
      } = router.query;

      console.log('Mobile payment result:', router.query);

      // INICIS mobile returns different parameters
      if (resultCode === '00' || resultCode === '0000') {
        // Success
        if (authToken && authUrl) {
          // Billing key registration flow
          const params = new URLSearchParams({
            resultCode: '0000',
            resultMsg: String(resultMsg || ''),
            orderNumber: String(oid || ''),
            authToken: String(authToken),
            authUrl: String(authUrl),
            tid: String(tid || ''),
            payMethod: String(payMethod || 'Card')
          });
          
          router.replace(`/payment/billing-process?${params.toString()}`);
        } else if (tid) {
          // Direct payment success
          const params = new URLSearchParams({
            resultCode: '0000',
            resultMsg: String(resultMsg || '성공'),
            orderNumber: String(oid || ''),
            tid: String(tid),
            amount: String(amt || ''),
            payMethod: String(payMethod || 'Card')
          });
          
          router.replace(`/payment/success?${params.toString()}`);
        }
      } else {
        // Failure
        const params = new URLSearchParams({
          resultCode: String(resultCode || 'UNKNOWN'),
          resultMsg: String(resultMsg || '결제가 실패했습니다.'),
          orderNumber: String(oid || '')
        });
        
        router.replace(`/payment/result?${params.toString()}`);
      }
    }
  }, [router.isReady, router.query]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#FFF3E0',
        p: 2
      }}
    >
      <CircularProgress sx={{ color: '#FFA726', mb: 3 }} />
      <Typography fontSize={18} fontWeight={600}>
        결제 결과를 처리하고 있습니다...
      </Typography>
      <Typography color="grey.600" mt={1}>
        잠시만 기다려주세요
      </Typography>
    </Box>
  );
}