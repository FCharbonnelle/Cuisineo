/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'firebasestorage.googleapis.com', 
      'images.unsplash.com',
      'images.pexels.com',
      'cdn.pixabay.com'
    ],
  },
};

export default nextConfig;
