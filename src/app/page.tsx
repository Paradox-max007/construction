import { db } from "@/lib/db";
import { serializeProvider, serializeCategory } from "@/lib/serialize";
import { MarketplaceApp } from "@/components/site/marketplace-app";

// Fetch everything needed for the home screen on the server for an instant,
// SEO-friendly first render. Subsequent views fetch client-side.
async function getHomeData() {
  const [categories, featured, topRated] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.provider.findMany({
      where: { featured: true },
      include: { category: { select: { id: true, name: true, slug: true, imageUrl: true, icon: true } } },
      orderBy: { rating: "desc" },
      take: 6,
    }),
    db.provider.findMany({
      where: { rating: { gte: 4.5 } },
      include: { category: { select: { id: true, name: true, slug: true, imageUrl: true, icon: true } } },
      orderBy: { rating: "desc" },
      take: 6,
    }),
  ]);

  return {
    categories: categories.map(serializeCategory),
    featured: featured.map((p) => serializeProvider(p)),
    topRated: topRated.map((p) => serializeProvider(p)),
  };
}

export default async function Home() {
  const { categories, featured, topRated } = await getHomeData();

  return <MarketplaceApp categories={categories} featured={featured} topRated={topRated} />;
}
