/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   images: {
//     domains: [
//       "www.xenda.online",
//       "xenda.online",
//       "cameroun.xenda.online",
//     ], // Add the domain here
//   },
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  images: {
    domains: [
      "www.xenda.online",
      "xenda.online",
      "cameroun.xenda.online",
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias['@sentry/node'] = '@sentry/browser';
    }
    return config;
  },
};

module.exports = nextConfig; // 👈 Removed analyzer