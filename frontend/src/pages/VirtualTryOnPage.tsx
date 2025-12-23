import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Upload, Camera, ChevronRight, RefreshCw, Download, Sparkles } from 'lucide-react';
import { generateTryOn } from '@/services/tryonService';
import apiService from '@/services/apiService';

// Define Interface matching what we use in Component
interface TryOnProduct {
  id: string;
  title: string;
  price: string | number;
  image_url: string;
}

const VirtualTryOnPage = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<TryOnProduct | null>(null);
  const [products, setProducts] = useState<TryOnProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await apiService.getProducts();
        // Map backend product to TryOnProduct interface
        const mappedProducts = (response.products || []).map((p: any) => ({
          id: String(p.id),
          title: p.name,
          price: p.price,
          image_url: p.image // Backend returns 'image', component uses 'image_url'
        }));

        setProducts(mappedProducts);
        if (mappedProducts.length > 0) setSelectedProduct(mappedProducts[0]);
      } catch (e) {
        console.error(e);
        setError("Failed to load products");
      }
    }
    load();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImagePreview(reader.result as string);
        setShowResult(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async () => {
    if (!selectedImage || !selectedProduct) return;

    setError(null);
    setIsProcessing(true);

    try {
      // Call backend try-on
      const result = await generateTryOn(
        selectedImage,
        selectedProduct.id
      );

      if (result.image_url) {
        setResultImage(result.image_url);
        setShowResult(true);
      } else {
        throw new Error("No image returned");
      }
    } catch (err: any) {
      setError(err?.message || "Try-on generation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetTryOn = () => {
    setSelectedImage(null);
    setSelectedImagePreview(null);
    setShowResult(false);
    setResultImage(null);
    setError(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-24 bg-card relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-primary uppercase tracking-[0.3em] text-sm font-medium">
                AI Powered
              </span>
            </div>
            <h1 className="font-display text-6xl md:text-8xl">
              VIRTUAL<br />
              <span className="text-gradient">TRY-ON</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-lg text-lg">
              See how our tees look on you before buying. Upload a photo and experience the future of online shopping.
            </p>
          </div>
        </section>

        {/* Try On Interface */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left: Upload & Preview */}
              <div className="space-y-6">
                <h2 className="font-display text-3xl">1. UPLOAD YOUR PHOTO</h2>

                <div className="relative">
                  {!selectedImagePreview ? (
                    <label className="block aspect-[3/4] bg-card border-2 border-dashed border-border hover:border-primary cursor-pointer transition-smooth group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                          <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-smooth" />
                        </div>
                        <div className="text-center">
                          <p className="text-foreground font-medium">Click to upload</p>
                          <p className="text-sm text-muted-foreground mt-1">or drag and drop</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Camera className="w-4 h-4" />
                          <span>Front-facing photo recommended</span>
                        </div>
                      </div>
                    </label>
                  ) : (
                    <div className="relative aspect-[3/4] bg-card">
                      <img
                        src={showResult && resultImage ? resultImage : selectedImagePreview}
                        alt={showResult ? "Try-on result" : "Your photo"}
                        className="w-full h-full object-cover"
                      />

                      {/* Processing overlay */}
                      {isProcessing && (
                        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-4">
                          <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                          <p className="text-foreground font-medium">Processing your image...</p>
                          <p className="text-sm text-muted-foreground">This may take a few moments</p>
                        </div>
                      )}

                      {/* Result overlay */}
                      {showResult && !isProcessing && (
                        <div className="absolute top-4 left-4 right-4 flex justify-between">
                          <span className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
                            Try-On Result
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              const a = document.createElement("a");
                              a.href = resultImage!;
                              a.download = "tryon-result.jpg";
                              a.click();
                            }}
                          >
                            <Download className="w-4 h-4" />
                            Save
                          </Button>
                        </div>
                      )}

                      {/* Reset button */}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-4 right-4"
                        onClick={resetTryOn}
                      >
                        Upload New
                      </Button>
                    </div>
                  )}
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                {/* Try On Button */}
                <Button
                  variant="hero"
                  className="w-full"
                  disabled={!selectedImagePreview || !selectedProduct || isProcessing}
                  onClick={handleTryOn}
                >
                  {isProcessing ? 'Processing...' : 'Try On Selected Tee'}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Right: Product Selection */}
              <div className="space-y-6">
                <h2 className="font-display text-3xl">2. SELECT A T-SHIRT</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowResult(false);
                      }}
                      className={`relative aspect-[3/4] bg-card overflow-hidden transition-all duration-300 ${selectedProduct?.id === product.id
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : 'hover:ring-1 hover:ring-border'
                        }`}
                    >
                      <img
                        src={product.image_url || "https://via.placeholder.com/200"}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-3">
                        <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                        <p className="text-xs text-muted-foreground">${Number(product.price).toFixed(2)}</p>
                      </div>
                      {selectedProduct?.id === product.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Selected Product Info */}
                {selectedProduct && (
                  <div className="bg-card p-6 border border-border">
                    <div className="flex gap-4">
                      <img
                        src={selectedProduct.image_url || "https://via.placeholder.com/80"}
                        alt={selectedProduct.title}
                        className="w-20 h-20 object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-display text-xl">{selectedProduct.title}</h3>
                        <p className="text-primary font-medium mt-1">${Number(selectedProduct.price).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default VirtualTryOnPage;
