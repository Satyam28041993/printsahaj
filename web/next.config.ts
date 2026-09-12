import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static files for Firebase Hosting. The verification desk is not this site.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
