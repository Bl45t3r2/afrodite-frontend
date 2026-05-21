/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: { missingSuspenseWithCSRBailout: false },
  output: 'standalone',
  images: { domains: ['res.cloudinary.com'] },
};

// build: 3
module.exports = nextConfig;