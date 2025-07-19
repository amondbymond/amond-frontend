import { useEffect } from 'react';

export default function PaymentClose() {
  useEffect(() => {
    // INICIS 결제창 닫기 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://stgstdpay.inicis.com/stdjs/INIStdPay_close.js'; // 테스트 환경
    script.charset = 'UTF-8';
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return null;
}