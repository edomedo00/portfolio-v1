import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/proyectos/:path*", destination: "/projects/:path*", permanent: true },
      { source: "/archivo/:path*", destination: "/archive/:path*", permanent: true },
      { source: "/acerca-de", destination: "/about", permanent: true },
      { source: "/acerca-de-mi", destination: "/about", permanent: true },
      { source: "/contacto", destination: "/contact", permanent: true },
    ];
  },
  images: {
    qualities: [75, 85, 90, 95],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
