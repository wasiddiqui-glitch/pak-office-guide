import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // no caching while coding
});

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);


