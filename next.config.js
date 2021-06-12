const withPlugins = require("next-compose-plugins");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const optimizedImages = require("next-optimized-images");

// const babelPluginImport = require("babel-plugin-import");

module.exports = withPlugins(
  [
    [withBundleAnalyzer, {}],
    [optimizedImages, {}],
    // [babelPluginImport, {}],
  ],
  {
    webpack: (config, options) => {
      config.plugins.push(
        new options.webpack.ProvidePlugin({ React: "react" })
      );
      return config;
    },
    images: {
      domains: [
        "itap-prod-s3.s3.ap-southeast-1.amazonaws.com",
        "itap-dev-s3.s3.ap-southeast-1.amazonaws.com",
        "itap-prod-s3.s3-ap-southeast-1.amazonaws.com",
        "itap-staging-s3.s3.ap-southeast-1.amazonaws.com",
        "itap-connected.com",
        "itap.spiritlabs.co",
        "vtt-file.s3-ap-southeast-1.amazonaws.com",
        "apollo-file-bucket.s3.ap-southeast-1.amazonaws.com",
        "*.*",
      ],
    },
    async headers() {
      return [
        {
          source: "/static/:all*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=5256000, must-revalidate",
            },
          ],
        },
        {
          source: "/:all*",
          headers: [
            {
              key: "X-Frame-Options",
              value: "sameorigin",
            },
            {
              key: "Content-Security-Policy",
              value: "frame-ancestors 'self'",
            },
            {
              key: "strict-transport-security",
              value: "max-age=31536000 ; includeSubDomain",
            },
          ],
        },
        {
          source: "/",
          headers: [
            {
              key: "X-Frame-Options",
              value: "sameorigin",
            },
            {
              key: "Content-Security-Policy",
              value: "frame-ancestors 'self'",
            },
            {
              key: "strict-transport-security",
              value: "max-age=31536000 ; includeSubDomain",
            },
          ],
        },
      ];
    },
    devIndicators: {
      autoPrerender: false,
    },
    future: {
      webpack5: true,
    },
    onDemandEntries: {
      // period (in ms) where the server will keep pages in the buffer
      maxInactiveAge: 30 * 1000,
      // number of pages that should be kept simultaneously without being disposed
      pagesBufferLength: 10,
    },
  }
);
