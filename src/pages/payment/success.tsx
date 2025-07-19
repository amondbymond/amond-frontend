import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button, Paper, Alert, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { apiCall } from '@/module/utils/api';

export default function PaymentSuccess() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URL에서 결제 결과 파라미터 확인
    if (router.isReady) {
      console.log('Payment success page - Query params:', router.query);
      
      const { 
        resultCode, 
        resultMsg, 
        tid, 
        MOID, 
        TotPrice, 
        goodName,
        applDate,
        applTime,
        billKey 
      } = router.query;

      console.log('Result code:', resultCode);
      console.log('Result message:', resultMsg);

      if (resultCode === '0000') {
        // 성공적으로 빌링키가 발급된 경우
        setPaymentData({
          tid,
          orderId: MOID || router.query.orderNumber,
          amount: TotPrice || '9900',
          productName: goodName || '프로 정기결제',
          approvalDate: applDate,
          approvalTime: applTime,
          billKey
        });
        
        // 빌링키가 있는 경우에만 서버에 저장
        if (billKey) {
          saveBillingKey({
            billKey,
            orderId: MOID || router.query.orderNumber,
            amount: TotPrice || '9900',
            productName: goodName || '프로 정기결제',
            tid
          });
        } else {
          setLoading(false);
        }
      } else {
        setError(resultMsg as string || '결제 처리 중 오류가 발생했습니다.');
      }
      
      setLoading(false);
    }
  }, [router.isReady, router.query]);

  const saveBillingKey = async (data: any) => {
    try {
      await apiCall({
        url: '/payment/inicis/save-billing-key',
        method: 'POST',
        body: data
      });
    } catch (error) {
      console.error('빌링키 저장 실패:', error);
      setError('구독 등록 중 오류가 발생했습니다. 고객센터로 문의해주세요.');
    }
  };

  const handleGoToMain = () => {
    router.push('/');
  };

  const handleGoToProject = () => {
    router.push('/project');
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography>결제 결과를 확인하고 있습니다...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#FFF3E0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper
        elevation={4}
        sx={{
          maxWidth: 600,
          width: '100%',
          p: 4,
          borderRadius: 4,
          textAlign: 'center'
        }}
      >
        {error ? (
          <>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Typography fontWeight={700} fontSize={24} mb={2}>
              결제 처리 실패
            </Typography>
            <Typography color="grey.600" mb={4}>
              결제 처리 중 문제가 발생했습니다. 다시 시도해주세요.
            </Typography>
            <Button 
              variant="contained" 
              color="warning"
              onClick={handleGoToMain}
              sx={{ fontWeight: 700 }}
            >
              메인으로 돌아가기
            </Button>
          </>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} />
            </Box>
            
            <Typography fontWeight={700} fontSize={28} mb={2}>
              구독 등록 완료!
            </Typography>
            
            <Typography color="grey.600" fontSize={16} mb={4}>
              정기결제가 성공적으로 등록되었습니다. 
              이제 프리미엄 기능을 이용하실 수 있습니다.
            </Typography>

            {paymentData && (
              <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, mb: 4, textAlign: 'left' }}>
                <Typography fontWeight={600} fontSize={16} mb={2}>
                  결제 정보
                </Typography>
                <Typography fontSize={14} mb={1}>
                  상품명: {paymentData.productName}
                </Typography>
                <Typography fontSize={14} mb={1}>
                  결제금액: {parseInt(paymentData.amount).toLocaleString()}원
                </Typography>
                <Typography fontSize={14} mb={1}>
                  주문번호: {paymentData.orderId}
                </Typography>
                <Typography fontSize={14} mb={1}>
                  거래번호: {paymentData.tid}
                </Typography>
                <Typography fontSize={14}>
                  승인일시: {paymentData.approvalDate} {paymentData.approvalTime}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="outlined"
                onClick={handleGoToMain}
                sx={{ fontWeight: 600 }}
              >
                메인으로
              </Button>
              <Button 
                variant="contained" 
                color="warning"
                onClick={handleGoToProject}
                sx={{ fontWeight: 700 }}
              >
                프로젝트 시작하기
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}