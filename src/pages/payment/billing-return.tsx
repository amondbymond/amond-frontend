import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { apiCall } from '@/module/utils/api';

export default function BillingReturn() {
  const router = useRouter();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady) {
      processBillingResult();
    }
  }, [router.isReady]);

  const processBillingResult = async () => {
    try {
      // Get all query parameters
      const queryParams = router.query;
      console.log('BILLAUTH Return - Query params:', queryParams);

      // Send all parameters to backend
      const response = await apiCall({
        url: '/inicis-webstandard/billing-return',
        method: 'POST',
        body: queryParams
      });

      console.log('BILLAUTH Return response:', response.data);

      if (response.data.success) {
        // Billing key registration successful
        const billKey = response.data.data?.billKey;
        
        // Show success message
        setTimeout(() => {
          router.replace(`/payment/success?type=billing&resultCode=0000&message=${encodeURIComponent('카드가 성공적으로 등록되었습니다. 첫 결제는 잠시 후 자동으로 처리됩니다.')}`);
        }, 2000);
      } else {
        // Registration failed
        setError(response.data.message || '카드 등록에 실패했습니다.');
        setTimeout(() => {
          router.replace(`/payment/result?resultCode=FAIL&resultMsg=${encodeURIComponent(response.data.message || '카드 등록에 실패했습니다.')}`);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Billing return processing error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || '결과 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      
      setTimeout(() => {
        router.replace(`/payment/result?resultCode=ERROR&resultMsg=${encodeURIComponent(errorMessage)}`);
      }, 3000);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: 2,
        bgcolor: '#FFF3E0',
        p: 3
      }}
    >
      {processing ? (
        <>
          <CircularProgress size={60} sx={{ color: '#FFA726' }} />
          <Typography fontSize={20} fontWeight={700} color="#FF9800">
            정기결제 카드 등록 중...
          </Typography>
          <Typography fontSize={16} color="grey.600" mt={1}>
            잠시만 기다려주세요
          </Typography>
        </>
      ) : error ? (
        <>
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            {error}
          </Alert>
          <Typography fontSize={14} color="grey.600" mt={2}>
            잠시 후 결과 페이지로 이동합니다...
          </Typography>
        </>
      ) : (
        <>
          <Typography fontSize={20} fontWeight={700} color="success.main">
            ✅ 카드가 성공적으로 등록되었습니다!
          </Typography>
          <Typography fontSize={16} color="grey.600" mt={1}>
            결과 페이지로 이동 중...
          </Typography>
        </>
      )}
    </Box>
  );
}