/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
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
