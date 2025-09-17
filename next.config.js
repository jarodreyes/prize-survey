/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@vercel/postgres']
  },
  images: {
    domains: ['avatars.githubusercontent.com']
  }
}

module.exports = nextConfig
