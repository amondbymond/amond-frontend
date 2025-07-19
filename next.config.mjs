/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // SSG일 경우
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
