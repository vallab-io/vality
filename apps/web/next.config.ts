import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vality-resources.s3.ap-northeast-2.amazonaws.com",
      },
    ],
  },
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
