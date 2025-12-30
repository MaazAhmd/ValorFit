import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getFeaturedProducts } from '@/services/productService';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Product } from '@/context/CartContext';

const FeaturedProducts = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const products = await getFeaturedProducts();
        setFeatured(products.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-primary uppercase tracking-[0.3em] text-sm font-medium">
              Curated Selection
            </span>
            <h2 className="font-display text-5xl md:text-6xl mt-4">
              FEATURED DROPS
            </h2>
          </div>
          <Link to="/shop" className="mt-6 md:mt-0">
            <Button variant="outline" className="group">
              View All
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-muted aspect-[3/4] rounded-lg"
              />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No featured products available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product, index) => (
              <div
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;

