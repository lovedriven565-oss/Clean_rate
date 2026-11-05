import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Подключает AI/D1/ratelimit-биндинги из wrangler.jsonc в `next dev`
// (без этого getCloudflareContext/getSearchBindings локально возвращают null).
// Только dev: на `next build`/`opennextjs-cloudflare build` вызов поднимает
// remote-прокси wrangler и сборка падает без CLOUDFLARE_API_TOKEN.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // SSG-страницы открывают remote-коннект OpenNext; на медленной сети дефолтные
  // 60с не хватает и сборка падает на случайной странице.
  staticPageGenerationTimeout: 180,
  experimental: {
    // Меньше страниц на воркер → меньше конкурирующих remote-коннектов и
    // пиковой памяти (vips при рендере OG-изображений).
    staticGenerationMaxConcurrency: 1,
  },
};

export default nextConfig;
