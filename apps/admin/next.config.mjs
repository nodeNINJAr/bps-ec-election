/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@bps/shared", "@bps/db"],
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
