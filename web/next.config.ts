import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static files for Firebase Hosting. The verification desk is not this site.
  output: "export",
  // Emit /tools/index.html instead of /tools.html. Plain Apache/LiteSpeed
  // (Hostinger) has no clean-URL rewrite of its own, and a bare /tools folder
  // with no index file answers 403, not the page.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
