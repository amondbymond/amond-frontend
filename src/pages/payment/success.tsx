import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function PaymentSuccess() {
  const router = useRouter();
  const { type, message } = router.query;

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      router.replace('/subscribe');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        p: 3,
        textAlign: 'center'
      }}
    >
      <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
      
      <Typography variant="h4" fontWeight={700} mb={2}>
        {type === 'billing' ? '카드 등록 완료!' : '결제 완료!'}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" mb={4} maxWidth={600}>
        {message || '정기결제를 위한 카드가 성공적으로 등록되었습니다. 이제 매월 자동으로 결제가 진행됩니다.'}
      </Typography>
      
      <Button
        variant="contained"
        onClick={() => router.replace('/subscribe')}
        sx={{ px: 4, py: 1.5 }}
      >
        구독 페이지로 돌아가기
      </Button>
      
      <Typography variant="caption" color="text.secondary" mt={2}>
        5초 후 자동으로 이동합니다...
      </Typography>
    </Box>
  );
}