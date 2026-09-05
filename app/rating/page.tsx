import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RatingContent } from "@/components/RatingContent";
import { getAllCategories, getAllCompanies } from "@/lib/db/queries";

export default async function RatingPage() {
  const [companies, categories] = await Promise.all([getAllCompanies(), getAllCategories()]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <RatingContent companies={companies} categories={categories} />
      <Footer />
    </div>
  );
}
