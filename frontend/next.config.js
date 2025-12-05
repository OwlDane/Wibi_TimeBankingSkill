/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    // Performance optimizations
    compress: true,
    productionBrowserSourceMaps: false,

    // Bundle analysis (optional - uncomment to use)
        webpack: (config, { isServer }) => {
        if (!isServer) {
            config.optimization.splitChunks.cacheGroups = {
            ...config.optimization.splitChunks.cacheGroups,
            vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                priority: 10,
            },
            };
        }
        return config;
        },

    // Experimental features for better performance
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
    },

    // Headers for caching
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=60, s-maxage=60',
                    },
                ],
            },
            {
                source: '/images/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },

    // Redirects for old routes (if needed)
    async redirects() {
        return [];
    },

    // Rewrites for API
    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: '/api/:path*',
                    destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/:path*`,
                },
            ],
        };
    },
};

module.exports = nextConfig;
