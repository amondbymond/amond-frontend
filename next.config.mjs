/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Removed static export to support API routes
  // output: "export",
  images: {
    // Keep unoptimized for now to avoid image optimization issues
    unoptimized: true,
  },
};

export default nextConfig;
