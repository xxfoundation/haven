const nextBuildId = require('next-build-id');

const nextConfig = {
    reactStrictMode: false,
    generateBuildId: () => nextBuildId({ dir: __dirname }),
    async headers() {
        return [
            {
                // matching all API routes
                source: "/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "elixxir-bins.s3-us-west-1.amazonaws.com" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    }
};



module.exports = nextConfig;
