import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import apiService from '@/services/apiService';
import { useCart, Product } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product/ProductCard';
import { ArrowLeft, Minus, Plus, Check, Truck, RotateCcw, Shield, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await apiService.getProduct(id);
        const fetchedProduct = data.product;
        // Normalize product data
        const p: Product = {
          ...fetchedProduct,
          images: fetchedProduct.images || [],
          sizes: fetchedProduct.sizes || [],
          colors: fetchedProduct.colors || [],
        };
        setProduct(p);

        // Fetch related products (optional optimization: fetch only if product loaded)
        const allProductsRes = await apiService.getProducts(p.category);
        const related = (allProductsRes.products || [])
          .filter((item: any) => String(item.id) !== String(p.id))
          .slice(0, 4);
        setRelatedProducts(related);

      } catch (err) {
        console.error(err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product || error) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-4xl mb-4">PRODUCT NOT FOUND</h1>
            <Link to="/shop">
              <Button variant="outline">Back to Shop</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }
    // Color is optional if array is empty
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast({
        title: "Please select a color",
        variant: "destructive",
      });
      return;
    }

    // Adapt product to cart item
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      colors: product.colors
    }, selectedSize, selectedColor, quantity);

    toast({
      title: "Added to cart",
      description: `${product.name} (${selectedSize}${selectedColor ? `, ${selectedColor}` : ''}) x${quantity}`,
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Product */}
        <section className="container mx-auto px-4 pb-20">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-card overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-8">
              {/* Header */}
              <div>
                {product.category === 'designer' && (
                  <span className="text-primary uppercase tracking-[0.3em] text-sm font-medium">
                    Designer Series
                  </span>
                )}
                <h1 className="font-display text-5xl md:text-6xl mt-2">{product.name}</h1>
                {product.designer && (
                  <p className="text-muted-foreground mt-2">by {product.designer}</p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="font-display text-4xl text-primary">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h4 className="font-display text-sm mb-3">
                    COLOR: <span className="text-muted-foreground font-body">{selectedColor || 'Select a color'}</span>
                  </h4>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-10 h-10 rounded-full border-2 transition-smooth ${selectedColor === color.name
                          ? 'border-primary scale-110'
                          : 'border-transparent hover:border-muted-foreground'
                          }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {selectedColor === color.name && (
                          <Check className="w-5 h-5 mx-auto text-primary-foreground drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h4 className="font-display text-sm mb-3">
                    SIZE: <span className="text-muted-foreground font-body">{selectedSize || 'Select a size'}</span>
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-14 h-14 border text-sm font-medium transition-smooth ${selectedSize === size
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-4 bg-secondary px-4 py-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:text-primary transition-smooth"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-medium w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:text-primary transition-smooth"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button variant="hero" className="flex-1" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Free Shipping</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">30-Day Returns</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Quality Guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-20 bg-card">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-4xl mb-12">YOU MAY ALSO LIKE</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
