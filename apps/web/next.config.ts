import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // /@username -> /[username]
      {
        source: "/@:username",
        destination: "/:username",
      },
      // /@username/slug -> /[username]/[slug]
      {
        source: "/@:username/:slug",
        destination: "/:username/:slug",
      },
    ];
  },
};

export default nextConfig;
