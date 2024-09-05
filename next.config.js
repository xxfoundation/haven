const nextBuildId = require('next-build-id');

// const cspHeader = `
//     default-src 'self' https://elixxir-bins.s3-us-west-1.amazonaws.com;
//     script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://elixxir-bins.s3-us-west-1.amazonaws.com https://apis.google.com https://accounts.google.com;
//     style-src 'self' 'unsafe-inline' *;
//     style-src-elem 'self' 'unsafe-inline' *;
//     img-src 'self' blob: data:;
//     font-src 'self' *;
//     object-src 'none';
//     base-uri 'self';
//     connect-src 'self' https://elixxir-bins.s3-us-west-1.amazonaws.com https://*.xxnode.io;
//     worker-src 'self' blob: https://elixxir-bins.s3-us-west-1.amazonaws.com;
//     form-action 'self';
//     frame-ancestors 'none';
//     block-all-mixed-content;
//     upgrade-insecure-requests;
// `

const nextConfig = {
    reactStrictMode: false,
    generateBuildId: () => nextBuildId({ dir: __dirname }),
    // async headers() {
    //     return [
    //         {
    //             // matching all API routes
    //             source: "/:path*",
    //             headers: [
    //                 { key: "Access-Control-Allow-Credentials", value: "true" },
    //                 { key: "Access-Control-Allow-Origin", value: "elixxir-bins.s3-us-west-1.amazonaws.com" }, // replace this your actual origin
    //                 { key: "Access-Control-Allow-Methods", value: "GET" },
    //                 { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    //                 },
    //                 {
    //                     key: 'Content-Security-Policy',
    //                     value: cspHeader.replace(/\n/g, ''),
    //                 },
    //             ]
    //         }
    //     ]
    // }
};



module.exports = nextConfig;
