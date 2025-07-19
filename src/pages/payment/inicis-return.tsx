import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';

// This page handles INICIS POST returns as a server-side rendered page
export default function InicisReturn({ resultCode, resultMsg, orderNumber, authToken, authUrl, idc_name }: any) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to billing process page with all the parameters
    if (resultCode === '0000' && authToken && authUrl) {
      const params = new URLSearchParams({
        resultCode,
        resultMsg: resultMsg || '',
        orderNumber: orderNumber || '',
        authToken: authToken || '',
        authUrl: authUrl || '',
        idc_name: idc_name || ''
      });
      
      router.replace(`/payment/billing-process?${params.toString()}`);
    } else {
      // Error case
      const errorParams = new URLSearchParams({
        resultCode: resultCode || 'UNKNOWN',
        resultMsg: resultMsg || '결제 처리 중 오류가 발생했습니다.'
      });
      
      router.replace(`/payment/result?${errorParams.toString()}`);
    }
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#FFF3E0'
    }}>
      <p>결제 처리 중...</p>
    </div>
  );
}

// Handle both GET and POST requests server-side
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, query } = context;
  
  console.log('INICIS Return - Method:', req.method);
  console.log('INICIS Return - Query:', query);

  // Next.js doesn't parse POST body by default in getServerSideProps
  // For POST requests from INICIS, the data might come as query parameters
  // or we need to parse the body manually
  let params: any = {};

  if (req.method === 'POST') {
    // Try to get from query first (INICIS might send as query even in POST)
    params = query;
    
    // If no query params, try to parse body
    if (Object.keys(params).length === 0) {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const body = Buffer.concat(buffers).toString();
      
      // Parse URL-encoded body
      if (body) {
        const searchParams = new URLSearchParams(body);
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
      }
    }
  } else {
    params = query;
  }

  console.log('Parsed params:', params);

  return {
    props: {
      resultCode: params.resultCode || '',
      resultMsg: params.resultMsg || '',
      orderNumber: params.orderNumber || '',
      authToken: params.authToken || '',
      authUrl: params.authUrl || '',
      idc_name: params.idc_name || '',
      mid: params.mid || '',
      netCancelUrl: params.netCancelUrl || '',
      charset: params.charset || '',
      merchantData: params.merchantData || ''
    }
  };
};