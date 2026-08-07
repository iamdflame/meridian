import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@meridian/sim"],
  webpack: (cfg) => {
    // @meridian/sim uses NodeNext-style ".js" imports that resolve to ".ts" sources.
    cfg.resolve.extensionAlias = { ".js": [".ts", ".tsx", ".js"] };
    return cfg;
  },
  async rewrites() {
    const api = process.env.MERIDIAN_SERVER ?? "http://127.0.0.1:8787";
    return [{ source: "/api/meridian/:path*", destination: `${api}/api/:path*` }];
  },
};

export default config;
