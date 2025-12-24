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
  async redirects() {
    return [
      // vality.io -> www.vality.io (301 Permanent Redirect)
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "vality.io",
          },
        ],
        destination: "https://www.vality.io/:path*",
        permanent: true, // 301 리다이렉트
      },
    ];
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
