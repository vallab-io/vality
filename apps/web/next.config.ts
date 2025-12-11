import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // /@username -> /[username]
      {
        source: "/@:username",
        destination: "/:username",
      },
      // /@username/newsletterSlug -> /[username]/[newsletterSlug]
      {
        source: "/@:username/:newsletterSlug",
        destination: "/:username/:newsletterSlug",
      },
      // /@username/newsletterSlug/issueSlug -> /[username]/[newsletterSlug]/[issueSlug]
      {
        source: "/@:username/:newsletterSlug/:issueSlug",
        destination: "/:username/:newsletterSlug/:issueSlug",
      },
    ];
  },
};

export default nextConfig;
