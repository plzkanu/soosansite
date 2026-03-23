import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Replit Object Storage → @google-cloud/storage(gRPC). 번들에 넣으면 배포 런타임에서 깨질 수 있음.
  serverExternalPackages: ["@replit/object-storage", "@google-cloud/storage"],
};

export default nextConfig;
