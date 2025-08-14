import { useState, useEffect } from 'react';
import { Box, Typography, Modal, Alert } from '@mui/material';
import { apiCall } from '@/module/utils/api';
import UnifiedButton from '@/component/ui/UnifiedButton';

interface InicisPaymentProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  buyerName: string;
  buyerEmail: string;
  buyerTel: string;
}

interface InicisConfig {
  mid: string;
  signKey: string;
  url: string;
  version: string;
  currency: string;
  charset: string;
}

interface PaymentRequest {
  version: string;
  gopaymethod: string;
  mid: string;
  oid: string;
  price: string;
  timestamp: string;
  use_chkfake: string;
  signature: string;
  verification: string;
  mKey: string;
  offerPeriod: string;
  charset: string;
  currency: string;
  goodname: string;
  buyername: string;
  buyertel: string;
  buyeremail: string;
  returnUrl: string;
  closeUrl: string;
  acceptmethod?: string;
}

declare global {
  interface Window {
    INIStdPay: {
      pay: (form: any) => void;
    };
  }
}

export default function InicisPayment({ 
  open, 
  onClose, 
  planName, 
  planPrice, 
  buyerName, 
  buyerEmail, 
  buyerTel 
}: InicisPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inicisLoaded, setInicisLoaded] = useState(false);

  // INICIS 환경 설정 (빌링용) - 환경변수 기반
  const INICIS_CONFIG: InicisConfig = {
    mid: process.env.NEXT_PUBLIC_INICIS_MID || 'INIBillTst',
    signKey: process.env.NEXT_PUBLIC_INICIS_SIGNKEY || 'SU5JTElURV9UUklQTEVERVNfS0VZU1RS',
    url: process.env.NEXT_PUBLIC_INICIS_URL || 'https://stgstdpay.inicis.com/stdjs/INIStdPay.js',
    version: '1.0',
    currency: 'WON',
    charset: 'UTF-8'
  };

  // INICIS JavaScript 로드
  useEffect(() => {
    if (open && !inicisLoaded) {
      const script = document.createElement('script');
      script.src = INICIS_CONFIG.url;
      script.charset = 'UTF-8';
      script.onload = () => setInicisLoaded(true);
      script.onerror = () => setError('INICIS 결제 모듈 로드에 실패했습니다.');
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [open, inicisLoaded]);

  // SHA256 해시 생성 함수 (백엔드 API에서 처리)
  const generateHashes = async (orderData: any) => {
    try {
      const response = await apiCall({
        url: '/payment/inicis/generate-hashes',
        method: 'POST',
        body: orderData
      });
      return response.data;
    } catch (error: any) {
      console.error('Hash generation error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || '해시 생성에 실패했습니다.';
      throw new Error(errorMessage);
    }
  };

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '010-1234-5678'; // 기본값
    
    // 숫자만 추출
    const numbers = phone.replace(/\D/g, '');
    
    // 전화번호 길이에 따라 포맷팅
    if (numbers.length === 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length === 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    } else {
      return '010-1234-5678'; // 기본값
    }
  };

  // 주문번호 생성
  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `AMOND_${timestamp}_${random}`;
  };

  // 빌링키 발급 요청
  const requestBillingKey = async () => {
    if (!inicisLoaded) {
      setError('결제 모듈이 아직 로드되지 않았습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        oid: generateOrderId(),
        price: planPrice.toString(), // TEST ONLY - Change back to: planPrice.toString()
        timestamp: Date.now().toString(),
        goodname: `${planName} 30일 이용권`,
        buyername: buyerName,
        buyertel: formatPhoneNumber(buyerTel),
        buyeremail: buyerEmail,
        mid: INICIS_CONFIG.mid,
        signKey: INICIS_CONFIG.signKey
      };

      // 서버에서 해시값 생성
      console.log('Sending order data:', orderData);
      const hashes = await generateHashes(orderData);
      
      // Check if this requires BILLAUTH for recurring payments
      if (hashes.requiresBillAuth) {
        console.log('Redirecting to BILLAUTH flow for recurring payments');
        // Get BILLAUTH registration data
        // Convert Korean plan names to English for API
        let planType = planName.toLowerCase();
        if (planName === '프로') planType = 'pro';
        else if (planName === '비즈니스') planType = 'business';
        else if (planName === '프리미엄') planType = 'premium';
        
        console.log('Requesting BILLAUTH data for plan:', planType);
        const billAuthResponse = await apiCall({
          url: `/inicis-webstandard/billing-auth?plan=${planType}`,
          method: 'GET'
        });
        
        console.log('BILLAUTH response:', billAuthResponse);
        
        if (billAuthResponse.data && billAuthResponse.data.data && billAuthResponse.data.data.paymentData) {
          const paymentData = billAuthResponse.data.data.paymentData;
          const jsUrl = billAuthResponse.data.data.jsUrl || INICIS_CONFIG.url;
          console.log('BILLAUTH payment data received:', paymentData);
          console.log('BILLAUTH JS URL:', jsUrl);
          
          // Load INICIS script if needed
          const loadInicisScript = () => {
            return new Promise((resolve, reject) => {
              if (window.INIStdPay) {
                resolve(true);
                return;
              }
              
              const script = document.createElement('script');
              script.src = jsUrl;
              script.charset = 'UTF-8';
              script.onload = () => {
                console.log('INICIS script loaded successfully');
                resolve(true);
              };
              script.onerror = () => {
                console.error('Failed to load INICIS script');
                reject(new Error('INICIS 스크립트 로드 실패'));
              };
              document.head.appendChild(script);
            });
          };
          
          // Ensure INICIS JS is loaded before proceeding
          try {
            await loadInicisScript();
          } catch (error) {
            throw new Error('INICIS 결제 모듈을 로드할 수 없습니다.');
          }
          
          // Create form for BILLAUTH
          const form = document.createElement('form');
          form.id = 'inicis-billauth-form';
          form.name = 'inicis-billauth-form';
          form.method = 'POST';
          form.action = '';  // Important: empty action to prevent default submission
          form.acceptCharset = 'UTF-8';
          form.style.display = 'none';
          
          // Log each parameter being added
          Object.entries(paymentData).forEach(([key, value]) => {
            console.log(`Adding form field: ${key} = ${value}`);
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
          });
          
          // Append form to body
          document.body.appendChild(form);
          console.log('BILLAUTH form created and added to DOM');
          
          // Call INICIS pay immediately after form is in DOM
          setTimeout(() => {
            try {
              if (window.INIStdPay && typeof window.INIStdPay.pay === 'function') {
                console.log('Calling INIStdPay.pay with form ID: inicis-billauth-form');
                
                // Try to detect popup blockers
                const testPopup = window.open('', '_blank', 'width=1,height=1');
                if (testPopup) {
                  testPopup.close();
                  
                  // Popup allowed, proceed with payment
                  window.INIStdPay.pay('inicis-billauth-form');
                  console.log('INICIS payment window should now be open');
                  
                  // Close the modal after initiating payment
                  onClose();
                } else {
                  // Popup blocked
                  throw new Error('팝업이 차단되었습니다. 브라우저의 팝업 차단을 해제해주세요.');
                }
              } else {
                throw new Error('INIStdPay.pay function not available');
              }
            } catch (error: any) {
              console.error('INICIS BILLAUTH error:', error);
              setError(error.message || '카드 등록 창 호출 중 오류가 발생했습니다.');
              // Clean up form on error
              if (document.body.contains(form)) {
                document.body.removeChild(form);
              }
            }
          }, 100); // Small delay to ensure DOM is ready
          
          return; // Exit early - BILLAUTH flow will handle the rest
        } else {
          console.error('BILLAUTH response missing payment data:', billAuthResponse);
          throw new Error('BILLAUTH 결제 데이터를 받지 못했습니다.');
        }
      }

      const paymentRequest: PaymentRequest = {
        version: INICIS_CONFIG.version,
        gopaymethod: 'Card', // 빌링키 발급은 카드만 가능
        mid: INICIS_CONFIG.mid,
        oid: orderData.oid,
        price: orderData.price,
        timestamp: orderData.timestamp,
        use_chkfake: 'Y',
        signature: hashes.data.signature,
        verification: hashes.data.verification, // verification 추가
        mKey: hashes.data.mKey,
        offerPeriod: 'M2', // M2: 월 자동결제
        charset: INICIS_CONFIG.charset,
        currency: INICIS_CONFIG.currency,
        goodname: orderData.goodname,
        buyername: orderData.buyername,
        buyertel: orderData.buyertel,
        buyeremail: orderData.buyeremail,
        returnUrl: `${window.location.origin}/service/payment/inicis-return`,
        closeUrl: `${window.location.origin}/service/payment/close`,
        acceptmethod: 'HPP(1):below1000:va_receipt:centerCd(Y)'
      };

      // INICIS 결제창 호출
      if (window.INIStdPay) {
        // 폼 엘리먼트 생성
        const form = document.createElement('form');
        form.id = 'inicis-payment-form';
        form.method = 'POST';
        form.style.display = 'none';
        
        Object.entries(paymentRequest).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        
        console.log('Form created and added to DOM:', form);
        console.log('Payment request data:', paymentRequest);
        
        // INICIS 결제창 호출 (약간의 지연 후)
        setTimeout(() => {
          try {
            console.log('Calling INIStdPay.pay with form:', form);
            console.log('Form is connected to DOM:', document.body.contains(form));
            window.INIStdPay.pay(form);
          } catch (error) {
            console.error('INICIS payment error:', error);
            setError('결제창 호출 중 오류가 발생했습니다.');
            // 폼 제거
            if (document.body.contains(form)) {
              document.body.removeChild(form);
            }
          }
        }, 100);
      } else {
        throw new Error('INICIS 결제 모듈을 찾을 수 없습니다.');
      }

    } catch (error: any) {
      setError(error.message || '결제 요청 중 오류가 발생했습니다.');
    } finally {
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
            onClick={requestBillingKey}
            disabled={loading || !inicisLoaded}
          >
            {loading ? '처리중...' : '정기결제 등록'}
          </UnifiedButton>
        </Box>
      </Box>
    </Modal>
  );
}