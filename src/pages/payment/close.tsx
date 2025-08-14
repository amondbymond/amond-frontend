import { useEffect } from 'react';

export default function PaymentClose() {
  useEffect(() => {
    // Load INICIS close script
    const script = document.createElement('script');
    script.src = 'https://stdpay.inicis.com/stdjs/INIStdPay_close.js';
    script.charset = 'UTF-8';
    script.type = 'text/javascript';
    document.head.appendChild(script);
  }, []);

  return null;
}