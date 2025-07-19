import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress } from '@mui/material';
import { apiCall } from '@/module/utils/api';

export default function BillingProcess() {
  const router = useRouter();
  const [processing, setProcessing] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (router.isReady && !isRequesting) {
      console.log('Billing process page - Query params:', router.query);
      
      const {
        resultCode,
        resultMsg,
        orderNumber,
        authToken,
        authUrl,
        idc_name
      } = router.query;

      if (resultCode === '0000' && authToken && authUrl) {
        // 빌링키 발급 요청
        setIsRequesting(true);
        requestBillingKeyIssuance({
          authToken: authToken as string,
          authUrl: authUrl as string,
          orderNumber: orderNumber as string,
          idc_name: idc_name as string
        });
      } else {
        // 인증 실패
        router.replace(`/payment/success?resultCode=${resultCode}&resultMsg=${encodeURIComponent(resultMsg as string || '인증에 실패했습니다.')}`);
      }
    }
  }, [router.isReady, router.query, isRequesting]);

  const requestBillingKeyIssuance = async (authData: any) => {
    try {
      console.log('Requesting billing key issuance with:', authData);
      
      // 백엔드에서 빌링키 발급 요청
      const response = await apiCall({
        url: '/payment/inicis/issue-billing-key',
        method: 'POST',
        body: authData
      });

      console.log('Billing key issuance response:', response.data);

      if (response.data.success) {
        // 빌링키 발급 성공 - 이제 멤버십 업그레이드 시도
        const { billKey, tid, applDate, applTime, cardNumber, cardName } = response.data.data;
        
        // 빌링키 저장 및 멤버십 업그레이드
        try {
          const saveBillingKeyResponse = await apiCall({
            url: '/payment/inicis/save-billing-key',
            method: 'POST',
            body: {
              orderNumber: authData.orderNumber,
              billingKey: billKey,
              cardNumber: cardNumber,
              cardName: cardName
            }
          });

          if (saveBillingKeyResponse.data.success) {
            // 멤버십 업그레이드 성공
            router.replace(`/payment/result?resultCode=0000&tid=${tid}&billKey=${billKey}&applDate=${applDate}&applTime=${applTime}&orderNumber=${authData.orderNumber}&membershipUpgraded=true`);
          } else {
            // 빌링키 저장 실패
            router.replace(`/payment/result?resultCode=BILLING_SAVE_FAIL&resultMsg=${encodeURIComponent(saveBillingKeyResponse.data.message || '빌링키 저장에 실패했습니다.')}`);
          }
        } catch (saveError: any) {
          console.error('Billing key save error:', saveError);
          router.replace(`/payment/result?resultCode=BILLING_SAVE_ERROR&resultMsg=${encodeURIComponent('빌링키 저장 중 오류가 발생했습니다.')}`);
        }
      } else {
        // 빌링키 발급 실패
        router.replace(`/payment/result?resultCode=FAIL&resultMsg=${encodeURIComponent(response.data.message || '빌링키 발급에 실패했습니다.')}`);
      }
    } catch (error: any) {
      console.error('Billing key issuance error:', error);
      const errorMessage = error?.response?.data?.message || '빌링키 발급 중 오류가 발생했습니다.';
      router.replace(`/payment/result?resultCode=ERROR&resultMsg=${encodeURIComponent(errorMessage)}`);
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
        bgcolor: '#FFF3E0'
      }}
    >
      <CircularProgress size={60} sx={{ color: '#FFA726' }} />
      <Typography fontSize={20} fontWeight={700} color="#FF9800">
        프로 멤버십 업그레이드 중...
      </Typography>
      <Typography fontSize={18} fontWeight={600} mt={2}>
        빌링키를 발급하고 있습니다
      </Typography>
      <Typography fontSize={14} color="grey.600" mt={1}>
        잠시만 기다려주세요. 곧 완료됩니다!
      </Typography>
    </Box>
  );
}