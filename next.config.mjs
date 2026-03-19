import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,

  // tell Next.js to use webpack instead of turbopack for builds
  turbopack: false,
};

export default withPWA(nextConfig);


