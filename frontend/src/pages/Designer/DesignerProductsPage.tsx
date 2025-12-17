import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct, Product } from "@/services/productService";
import { useAuth } from "@/context/AuthContext";
import apiService from "@/services/apiService";
import { Upload, Image, Trash2 } from "lucide-react";

export default function DesignerProductsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", price: "", description: "" });
  const [error, setError] = useState<string | null>(null);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?mode=login");
      return;
    }
    if (user?.role !== "designer") {
      navigate("/");
      return;
    }
    load();
  }, [isAuthenticated, user, navigate]);

  async function load() {
    setLoading(true);
    try {
      const data = await getProducts();
      // filter to own products
      const mine = data.filter((p) => p.owner === user?.id);
      setItems(mine);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setImageFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate image
    if (!imageFile) {
      setError("Please upload a product image");
      return;
    }

    setSubmitting(true);
    try {
      const productData = {
        name: form.title,
        price: parseFloat(form.price),
        description: form.description,
        category: "designer",
        designerName: user?.name,
        designerId: user?.id,
      };

      await apiService.createProductWithImage(productData, imageFile);

      // Reset form
      setForm({ title: "", price: "", description: "" });
      clearImage();
      load();
    } catch (e: any) {
      setError(e?.message || "Failed to create");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProduct(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      setError(e?.message || "Failed to delete");
    }
  }

  if (!isAuthenticated || user?.role !== "designer") return null;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Designer · My Products</h1>

      {/* Create Product Form */}
      <form onSubmit={handleCreate} className="bg-card border border-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Product</h2>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Title</label>
            <input
              className="w-full border px-3 py-2 rounded-lg bg-background"
              placeholder="Product title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Price ($)</label>
            <input
              className="w-full border px-3 py-2 rounded-lg bg-background"
              placeholder="49.00"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Description</label>
          <textarea
            className="w-full border px-3 py-2 rounded-lg bg-background min-h-[80px]"
            placeholder="Describe your product..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Image Upload Section */}
        <div className="mb-4">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Product Image</label>
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="flex items-center gap-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{imageFile?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {((imageFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="px-3 py-1.5 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="py-8 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Click to upload product image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, JPEG, GIF, WEBP (max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Creating Product...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Add Product
            </>
          )}
        </button>
      </form>

      {/* Product List */}
      <h2 className="text-lg font-semibold mb-4">Your Products</h2>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
          <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No products yet. Add your first product above!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden group">
              <div className="aspect-square overflow-hidden bg-muted">
                {(p.image_url || (p as any).image) && (
                  <img
                    src={p.image_url || (p as any).image}
                    alt={(p as any).name || p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{(p as any).name || p.title}</h3>
                <p className="text-muted-foreground">${Number(p.price).toFixed(2)}</p>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="mt-3 text-sm text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}