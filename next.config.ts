import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Change to 'export' for PocketBase static serving
  output: "export",

  images: {
    // 2. 'export' mode doesn't support the default Next.js Image Optimization API
    // because there's no Node.js server to resize them on the fly.
    unoptimized: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // 3. Recommended: Add your Cloudflare/Local domain so you can
      // render images uploaded to your PocketBase collections
      {
        protocol: "http",
        hostname: "192.168.1.220",
      },
      {
        protocol: "https",
        hostname: "catering.yourdomain.com", // Replace with your actual tunnel URL
      },
    ],
  },

  // 4. Optional: If you use trailing slashes, it helps PocketBase
  // resolve routes correctly in some folder structures.
  trailingSlash: true,
};

export default nextConfig;
