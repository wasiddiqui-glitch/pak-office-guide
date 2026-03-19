export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: "https://pk-office-guide.vercel.app/sitemap.xml",
  };
}
