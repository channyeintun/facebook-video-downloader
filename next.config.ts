import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Access-Control-Expose-Headers",
            value: "Content-Length",
          },
        ],
      },
    ];
  },
  // Allow ngrok and other tunneling services for development
  allowedDevOrigins: [
    "*.ngrok.io",
    "*.ngrok-free.app",
    "*.loca.lt",
    "*.localhost.run",
  ],
};

export default nextConfig;
