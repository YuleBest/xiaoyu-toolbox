import type { Plugin } from "vite";
import { allTools } from "../config/tools";

export default function sitemapPlugin(): Plugin {
  return {
    name: "vite-plugin-sitemap",
    apply: "build",
    generateBundle() {
      const baseUrl = "https://tool.yule.ink";
      const staticPaths = ["", "/about", "/categories", "/search"];
      const toolsPaths = allTools.map((tool) => tool.path);

      const allPaths = [...staticPaths, ...toolsPaths];

      // generate sitemap.xml
      const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths
  .map(
    (path) => `  <url>
    <loc>${baseUrl}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === "" ? "1.0" : "0.8"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: sitemapContent,
      });

      // generate robots.txt
      const robotsContent = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: robotsContent,
      });
    },
  };
}
