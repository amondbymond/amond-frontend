/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 일시적으로 비활성화 (INICIS 중복 요청 방지)
  // Disable x-powered-by header
  poweredByHeader: false,
  // No basePath - app will be at subdomain root
  // basePath: '/service',
  // Allow INICIS domains
  async headers() {
    return [
      {
        source: '/payment/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://stgstdpay.inicis.com'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type'
          }
        ],
      },
    ];
  },
}

module.exports = nextConfig