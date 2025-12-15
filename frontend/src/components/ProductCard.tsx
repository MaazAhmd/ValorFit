import React from "react";

export type Product = {
  id: string;
  title: string;
  price: string;
  image: string; // url
  tags?: string[];
};

type Props = {
  product: Product;
  onTryOn: (p: Product) => void;
  onView: (p: Product) => void;
};

export default function ProductCard({ product, onTryOn, onView }: Props) {
  return (
    <article
      className="bg-white border rounded-xl shadow-sm p-4 hover:shadow-md transition-colors"
      aria-labelledby={`product-${product.id}`}
    >
      <div className="w-full aspect-[4/5] rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
        <img src={product.image} alt={product.title} className="object-cover w-full h-full" />
      </div>

      <header className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 id={`product-${product.id}`} className="text-base font-semibold text-black">
            {product.title}
          </h3>
          <p className="text-sm text-black/70 mt-1">{product.tags?.slice(0,2).join(" • ")}</p>
        </div>
        <div className="text-sm font-medium text-black">{product.price}</div>
      </header>

      <footer className="mt-4 flex gap-3">
        <button
          onClick={() => onTryOn(product)}
          className="flex-1 bg-black text-white rounded-lg py-2 text-sm font-semibold shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
        >
          Try On
        </button>
        <button
          onClick={() => onView(product)}
          className="flex-[0.8] border border-black text-black rounded-lg py-2 text-sm font-semibold"
        >
          View
        </button>
      </footer>
    </article>
  );
}