import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@gpbm/shared", "@gpbm/providers", "@gpbm/parsers"]
};

export default nextConfig;
