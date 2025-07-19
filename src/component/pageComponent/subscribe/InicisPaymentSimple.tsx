import { useState } from 'react';
import { Box, Typography, Modal, Alert } from '@mui/material';
import { apiCall } from '@/module/utils/api';
import UnifiedButton from '@/component/ui/UnifiedButton';

interface InicisPaymentSimpleProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  buyerName: string;
  buyerEmail: string;
  buyerTel: string;
}

export default function InicisPaymentSimple({ 
  open, 
  onClose, 
  planName, 
  planPrice, 
  buyerName, 
  buyerEmail, 
  buyerTel 
}: InicisPaymentSimpleProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 결제 요청
  const requestPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 주문번호 생성
      const orderNumber = `AMOND_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // 백엔드에서 결제 URL 생성
      const response = await apiCall({
        url: '/payment/inicis/create-payment-url',
        method: 'POST',
        body: {
          orderNumber,
          planName,
          planPrice,
          buyerName,
          buyerEmail,
          buyerTel: buyerTel || '010-1234-5678'
        }
      });

      if (response.data?.success && response.data?.paymentUrl) {
        // 결제 페이지로 이동
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error(response.data?.message || '결제 URL 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Payment request error:', error);
      setError(error.message || '결제 요청 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: 24,
          p: 4,
          outline: 'none'
        }}
      >
        <Typography fontWeight={700} fontSize={24} mb={2}>
          정기결제 등록
        </Typography>
        
        <Typography color="grey.600" fontSize={14} mb={3}>
          {planName} 요금제를 정기결제로 등록합니다. 
          매월 자동으로 {planPrice.toLocaleString()}원이 결제됩니다.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography fontWeight={600} fontSize={16} mb={1}>
            결제 정보
          </Typography>
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
            <Typography fontSize={14} mb={0.5}>
              상품명: {planName} 정기결제
            </Typography>
            <Typography fontSize={14} mb={0.5}>
              금액: {planPrice.toLocaleString()}원/월
            </Typography>
            <Typography fontSize={14} mb={0.5}>
              구매자: {buyerName}
            </Typography>
            <Typography fontSize={14}>
              이메일: {buyerEmail}
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          결제 페이지로 이동합니다. 결제 완료 후 자동으로 돌아옵니다.
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <UnifiedButton 
            variant="white" 
            onClick={onClose}
            disabled={loading}
          >
            취소
          </UnifiedButton>
          <UnifiedButton 
            variant="colored"
            onClick={requestPayment}
            disabled={loading}
          >
            {loading ? '처리중...' : '결제하기'}
          </UnifiedButton>
        </Box>
      </Box>
    </Modal>
  );
}