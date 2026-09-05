import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BrandHero } from "@/components/brands/BrandHero";
import { ProductCard } from "@/components/gear/ProductCard";
import { CompanyCard } from "@/components/CompanyCard";
import { brands, affiliateProducts, companies } from "@/lib/mock-data";

export function generateStaticParams() {
  return brands.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) return {};
  return {
    title: `${brand.name} — техника и химия для клининга | Клининг Рейтинг`,
    description: brand.description,
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) notFound();

  const products = affiliateProducts.filter((p) => p.brandId === brand.id);
  const partnerCompanies = companies.filter((c) => c.equipment?.includes(brand.id));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <BrandHero brand={brand} />

        {products.length > 0 && (
          <section className="container py-16">
            <div className="mb-8 flex flex-col items-center gap-2 text-center">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Товары {brand.name}
              </h2>
              <p className="max-w-lg text-muted-foreground">
                Внешние ссылки на страницы продуктов; наличие и статус продавца уточняйте перед покупкой
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </section>
        )}

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="container">
            <div className="mb-8 flex flex-col items-center gap-2 text-center">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Компании рейтинга на {brand.name}
              </h2>
              <p className="max-w-lg text-muted-foreground">
                Компании, в профиле которых указан этот бренд; связь требует подтверждения представителем
              </p>
            </div>

            {partnerCompanies.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {partnerCompanies.map((company, i) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Пока ни одна компания в рейтинге не отметила это оборудование.
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
