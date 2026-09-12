import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zaplink.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs", "/report", "/sign-in", "/sign-up"],
        disallow: ["/dashboard/", "/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
