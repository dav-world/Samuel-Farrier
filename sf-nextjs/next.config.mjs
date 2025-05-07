/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Remove the deprecated 'domains' array if present
    // domains: ['cdn.sanity.io', 'your-other-domains.com'],

    // Use remotePatterns instead
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
      // Add more patterns as needed for other domains
      // {
      //   protocol: 'https',
      //   hostname: 'your-other-domains.com',
      //   port: '',
      //   pathname: '/**',
      // },
    ],
  },
  // ...other config options
};

export default nextConfig;