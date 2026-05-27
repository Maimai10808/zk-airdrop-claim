/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@provablehq/wasm"],
  },
};

export default nextConfig;
