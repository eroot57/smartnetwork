/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: [
        'raw.githubusercontent.com',
        'www.arweave.net',
        'arweave.net',
        'solana.com'
      ],
      dangerouslyAllowSVG: true,
      contentDispositionType: 'attachment',
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    // Disable specific ESLint rules during development
    eslint: {
      ignoreDuringBuilds: true, // Remove this in production
    },
    typescript: {
      ignoreBuildErrors: true, // Remove this in production
    },
    webpack: (config) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      return config;
    },
  }
  
  export default nextConfig;