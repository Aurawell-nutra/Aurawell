export default function robots() {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://aaurawell.com").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },

    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
