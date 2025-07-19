import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress, Paper, Alert, Button } from '@mui/material';
import { apiCall } from '@/module/utils/api';

export default function InicisResult() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false); // Hide debug by default
  const [waitingTime, setWaitingTime] = useState(0);
  const [processing, setProcessing] = useState(false);
  const processedRef = useRef(false);
  
  useEffect(() => {
    // Start a timer to show how long we've been waiting
    const interval = setInterval(() => {
      setWaitingTime(prev => prev + 1);
    }, 1000);
    
    // Create a form to receive INICIS POST data
    if (typeof window !== 'undefined') {
      // Create hidden form
      const form = document.createElement('form');
      form.id = 'inicis-receiver';
      form.method = 'POST';
      form.style.display = 'none';
      document.body.appendChild(form);
      
      // Listen for form submit (won't work with static export, but worth trying)
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form submitted!', e);
      });
    }
    
    // Try to intercept POST data using a different approach
    // Check if INICIS added any data to the page
    const checkForInicisData = () => {
      // Check all forms on the page
      const forms = document.querySelectorAll('form');
      forms.forEach((form, index) => {
        console.log(`Form ${index}:`, form);
        const formData = new FormData(form as HTMLFormElement);
        const entries = Array.from(formData.entries());
        if (entries.length > 0) {
          console.log(`Form ${index} data:`, entries);
        }
      });
      
      // Check for any hidden inputs INICIS might have added
      const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
      if (hiddenInputs.length > 0) {
        console.log('Hidden inputs found:', hiddenInputs.length);
        hiddenInputs.forEach((input: any) => {
          console.log(`Hidden input: ${input.name} = ${input.value}`);
        });
      }
    };
    
    // Check immediately and after a delay
    checkForInicisData();
    setTimeout(checkForInicisData, 500);
    setTimeout(checkForInicisData, 1000);
    
    // Log debug info
    const fullUrl = window.location.href;
    const searchParams = window.location.search;
    const urlParams = new URLSearchParams(searchParams);
    const allUrlParams = Object.fromEntries(urlParams.entries());
    
    const debug = {
      fullUrl,
      searchParams,
      urlParams: allUrlParams,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    };
    
    console.log('=== INICIS Result Page Loaded ===');
    console.log('URL:', fullUrl);
    console.log('Params:', allUrlParams);
    console.log('Referrer:', document.referrer);
    
    setDebugInfo(debug);
    
    return () => {
      clearInterval(interval);
      // Clean up form
      const form = document.getElementById('inicis-receiver');
      if (form) {
        document.body.removeChild(form);
      }
    };
  }, []);
  
  // Process INICIS response through backend
  const processInicisResponse = async () => {
    if (processing || processedRef.current) return;
    
    setProcessing(true);
    processedRef.current = true;
    
    try {
      // Since we can't receive POST data directly, we'll check with the backend
      // The backend might have received the data if INICIS called it
      const response = await apiCall({
        url: '/payment/inicis/check-last-response',
        method: 'POST',
        body: {
          referrer: document.referrer,
          timestamp: Date.now()
        }
      });
      
      if (response.data?.success && response.data?.data) {
        const { resultCode, authToken, authUrl, orderNumber, idc_name } = response.data.data;
        
        if (resultCode === '0000' && authToken && authUrl) {
          const params = new URLSearchParams({
            resultCode,
            resultMsg: response.data.data.resultMsg || '',
            orderNumber: orderNumber || '',
            authToken,
            authUrl,
            idc_name: idc_name || ''
          });
          
          router.replace(`/payment/billing-process?${params.toString()}`);
        } else {
          router.replace('/payment/result?resultCode=FAILED&resultMsg=' + encodeURIComponent('결제가 실패했습니다.'));
        }
      } else {
        // No response found, payment might have failed
        router.replace('/payment/result?resultCode=NO_RESPONSE&resultMsg=' + encodeURIComponent('결제 응답을 받지 못했습니다.'));
      }
    } catch (error) {
      console.error('Error processing INICIS response:', error);
      router.replace('/payment/result?resultCode=ERROR&resultMsg=' + encodeURIComponent('결제 처리 중 오류가 발생했습니다.'));
    }
  };
  
  useEffect(() => {
    if (router.isReady) {
      // Check if we have any query parameters (GET request)
      if (Object.keys(router.query).length > 0) {
        const { resultCode, resultMsg, authToken, authUrl, orderNumber, idc_name, oid } = router.query;
        
        if (resultCode === '0000' && authToken && authUrl) {
          console.log('Success via GET! Redirecting to billing process...');
          const params = new URLSearchParams({
            resultCode: String(resultCode),
            resultMsg: String(resultMsg || ''),
            orderNumber: String(orderNumber || oid || ''),
            authToken: String(authToken),
            authUrl: String(authUrl),
            idc_name: String(idc_name || '')
          });
          
          router.replace(`/payment/billing-process?${params.toString()}`);
        } else if (resultCode) {
          console.log('Payment failed via GET. Result code:', resultCode);
          const errorParams = new URLSearchParams({
            resultCode: String(resultCode || 'UNKNOWN'),
            resultMsg: String(resultMsg || '결제가 취소되었거나 실패했습니다.'),
            orderNumber: String(orderNumber || oid || '')
          });
          
          router.replace(`/payment/result?${errorParams.toString()}`);
        } else {
          // No GET parameters, might be a POST request
          // Wait a bit then check with backend
          if (waitingTime >= 2 && !processedRef.current) {
            processInicisResponse();
          }
        }
      } else if (waitingTime >= 2 && !processedRef.current) {
        // No parameters at all, check with backend
        processInicisResponse();
      }
    }
  }, [router.isReady, router.query, waitingTime]);

  // Manual redirect helper
  const handleManualRedirect = () => {
    // Try to extract any error info from the page
    router.replace('/payment/result?resultCode=MANUAL&resultMsg=' + encodeURIComponent('결제 처리 중 문제가 발생했습니다. 다시 시도해주세요.'));
  };

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
        잠시만 기다려주세요 ({waitingTime}초)
      </Typography>
      
      {/* Show manual redirect after 5 seconds */}
      {waitingTime > 5 && (
        <Alert severity="warning" sx={{ mt: 3, mb: 2 }}>
          <Typography variant="body2" mb={1}>
            결제 결과 처리가 지연되고 있습니다.
          </Typography>
          <Typography variant="body2" mb={2}>
            INICIS에서 POST 데이터를 받지 못했을 수 있습니다.
          </Typography>
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleManualRedirect}
            sx={{ mt: 1 }}
          >
            수동으로 돌아가기
          </Button>
        </Alert>
      )}
      
      {/* Debug info - remove in production */}
      {showDebug && (
        <Paper sx={{ mt: 4, p: 2, maxWidth: 600, width: '100%', bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>Debug Info:</Typography>
          <Typography variant="body2" color="error" gutterBottom>
            ⚠️ Static export cannot receive POST data from INICIS
          </Typography>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
}