import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  webpack: config => {
    config.resolve.alias["fone-design-system_v1"] = path.resolve(
      "C:/Users/letit/OneDrive/문서/project/fone-design-system/src/index.ts",
    );
    return config;
  },
};

export default nextConfig;
