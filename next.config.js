/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour les images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xsnadtxqoyqfoqbunzen.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/profile-pictures/**',
      },
    ],
  },
  // Autres configurations de votre projet
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
