import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import apiService from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { ChevronDown, SlidersHorizontal, X, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  image: string;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  designer?: string;
  isFeatured: boolean;
  isNew: boolean;
  quantity: number;
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';
type CategoryFilter = 'all' | 'normal' | 'designer';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);

  const categoryFromUrl = searchParams.get('category') as CategoryFilter | null;
  const [category, setCategory] = useState<CategoryFilter>(categoryFromUrl || 'all');

  const allSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProducts();
        // Filter only in-stock products (quantity > 0)
        const inStockProducts = (response.products as Product[]).filter(p => p.quantity > 0);
        setProducts(inStockProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter(p =>
        selectedSizes.some(size => p.sizes?.includes(size))
      );
    }

    // Price filter
    result = result.filter(p =>
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return result;
  }, [products, category, selectedSizes, priceRange, sortBy]);

  const handleCategoryChange = (newCategory: CategoryFilter) => {
    setCategory(newCategory);
    if (newCategory === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', newCategory);
    }
    setSearchParams(searchParams);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setPriceRange([0, 200]);
    handleCategoryChange('all');
  };

  const hasActiveFilters = selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < 200 || category !== 'all';

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-24 bg-card">
          <div className="container mx-auto px-4">
            <span className="text-primary uppercase tracking-[0.3em] text-sm font-medium">
              Collection
            </span>
            <h1 className="font-display text-6xl md:text-8xl mt-4">
              {category === 'designer' ? 'DESIGNER SERIES' : category === 'normal' ? 'CLASSIC COLLECTION' : 'ALL T-SHIRTS'}
            </h1>
            <p className="text-muted-foreground mt-4 max-w-lg">
              {category === 'designer'
                ? 'Limited edition pieces crafted by world-renowned designers.'
                : category === 'normal'
                  ? 'Timeless essentials made from premium materials.'
                  : 'Explore our complete collection of premium streetwear.'}
            </p>
          </div>
        </section>

        {/* Toolbar */}
        <section className="sticky top-16 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1 w-5 h-5 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full">
                      !
                    </span>
                  )}
                </Button>
                <span className="text-muted-foreground text-sm">
                  {loading ? 'Loading...' : `${filteredProducts.length} products`}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none bg-secondary border border-border px-4 py-2 pr-10 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Panel */}
        {showFilters && (
          <section className="bg-card border-b border-border animate-slide-up">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Category */}
                <div>
                  <h4 className="font-display text-lg mb-4">CATEGORY</h4>
                  <div className="space-y-2">
                    {(['all', 'normal', 'designer'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`block text-sm transition-smooth ${category === cat
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        {cat === 'all' ? 'All T-Shirts' : cat === 'normal' ? 'Classic Collection' : 'Designer Series'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <h4 className="font-display text-lg mb-4">SIZE</h4>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`w-10 h-10 border text-sm font-medium transition-smooth ${selectedSizes.includes(size)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h4 className="font-display text-lg mb-4">PRICE</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-20 bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                        min={0}
                        max={priceRange[1]}
                      />
                      <span className="text-muted-foreground">to</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-20 bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                        min={priceRange[0]}
                      />
                    </div>
                  </div>
                </div>

                {/* Clear */}
                <div className="flex items-end">
                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="gap-2">
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard product={product as any} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="font-display text-2xl text-muted-foreground mb-4">
                  NO PRODUCTS FOUND
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters to find what you're looking for.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ShopPage;
