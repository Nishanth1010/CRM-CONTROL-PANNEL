/** @type {import('next').NextConfig} */
const config = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    async headers() {
      return [
        {
          // Define which API routes should have the CORS headers
          source: '/api/:path*', // This applies the CORS headers to all API routes
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: 'https://admin.bnisa.idzone.in' }, // Allow requests from your React app
            { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' }, // Allowed methods
            {
              key: 'Access-Control-Allow-Headers',
              value:
                'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
            },
          ],
        },
      ];
    },
  };
  
  export default config;
  