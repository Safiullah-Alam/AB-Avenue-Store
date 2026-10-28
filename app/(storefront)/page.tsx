import { getServerInitialProducts } from "@/lib/server-products";
import { StorefrontHomeView } from "@/components/storefront/StorefrontHomeView";

// Incremental Static Regeneration: Cache and revalidate on the edge
export const revalidate = 60;

export default async function HomePage() {
  const initialProducts = await getServerInitialProducts();
  return <StorefrontHomeView initialProducts={initialProducts} />;
}
