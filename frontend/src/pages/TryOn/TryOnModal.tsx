import React, { useState } from "react";
import type { Product } from "../../components/ProductCard";
import { submitTryOn } from "../../services/aiService";

type Props = {
  open: boolean;
  onClose: () => void;
  product: Product | null;
};

export default function TryOnModal({ open, onClose, product }: Props) {
  const [userFile, setUserFile] = useState<File | null>(null);
  const [userPreview, setUserPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function onUserChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Please upload an image file.");
    setUserFile(f);
    const r = new FileReader();
    r.onload = () => setUserPreview(String(r.result));
    r.readAsDataURL(f);
  }

  async function handleGenerate() {
    setError(null);
    if (!userPreview || !product) return setError("Upload your photo and choose a design.");
    setLoading(true);
    try {
      // send user base64 + garment image url (product.image) to backend
      const payload = {
        model_image: userPreview, // base64 data URI
        garment_image: product.image, // backend can accept URL or base64
        mode: "balanced",
      };
      const res = await submitTryOn(payload);
      if (res.imageBase64) {
        setResultImage(`data:image/png;base64,${res.imageBase64}`);
      } else if (res.id) {
        // backend returned an id — frontend can poll or show progress.
        setError("Try-on submitted. Processing on server. Please check your gallery shortly.");
      } else {
        setError("Unexpected server response.");
      }
    } catch (err: any) {
      setError(err?.message || "Try‑On failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30">
      <div className="w-full max-w-3xl bg-white rounded-xl p-6 shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">AI Try‑On</h3>
            <p className="text-sm text-black/70 mt-1">Upload your photo and preview the selected design on you.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn">Close</button>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium">Your photo</label>
            <input type="file" accept="image/*" onChange={onUserChange} className="mt-2" />
            {userPreview && <div className="mt-3 border rounded-lg overflow-hidden"><img src={userPreview} alt="you" className="w-full object-cover" /></div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Selected design</label>
            <div className="mt-2 border rounded-lg overflow-hidden">
              <img src={product?.image ?? "/assets/products/tee-1.jpg"} alt={product?.title} className="w-full object-cover" />
            </div>
            <div className="text-sm text-black/70 mt-2">{product?.title}</div>
          </div>
        </div>

        {error && <div className="mt-4 text-red-700">{error}</div>}

        <div className="mt-6 flex items-center gap-3">
          <button onClick={handleGenerate} disabled={loading} className="bg-black text-white rounded-lg px-5 py-2 font-semibold">
            {loading ? "Generating…" : "Generate preview"}
          </button>
          <button onClick={() => { setUserFile(null); setUserPreview(null); setResultImage(null); setError(null); }} className="border border-black rounded-lg px-4 py-2">Reset</button>
        </div>

        {resultImage && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold">Preview</h4>
            <div className="mt-3 border rounded-lg overflow-hidden">
              <img src={resultImage} alt="Try-on preview" className="w-full object-contain" />
            </div>
            <div className="mt-3 flex gap-3">
              <button onClick={() => { /* proceed to checkout flow */ }} className="bg-black text-white rounded-lg px-4 py-2">Proceed to checkout</button>
              <button onClick={() => setResultImage(null)} className="border border-black rounded-lg px-4 py-2">Retry</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}