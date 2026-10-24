import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/signup",
        destination: "/auth/signin?tab=signup",
        permanent: false,
      },
      {
        source: "/login",
        destination: "/auth/signin?tab=signin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
