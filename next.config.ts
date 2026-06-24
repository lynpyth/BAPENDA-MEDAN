import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io', // UploadThing
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  turbopack: {
    // Explicitly set the project root so Turbopack doesn't pick up the
    // parent directory's package-lock.json as the workspace root.
    root: __dirname,
  },
};

export default nextConfig;
