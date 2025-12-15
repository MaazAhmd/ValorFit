import React, { useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard";
import type { Product } from "../../components/ProductCard";
import TryOnModal from "../TryOn/TryOnModal";

const SAMPLE_PRODUCTS: Product[] = [
	{
		id: "p1",
		title: "Mono Logo Tee",
		price: "$34",
		image: "/assets/products/tee-1.jpg",
		tags: ["Minimal", "Unisex"],
	},
	{
		id: "p2",
		title: "Vintage Script Tee",
		price: "$39",
		image: "/assets/products/tee-2.jpg",
		tags: ["Vintage", "Soft Cotton"],
	},
	{
		id: "p3",
		title: "Abstract Print Tee",
		price: "$42",
		image: "/assets/products/tee-3.jpg",
		tags: ["Art", "Limited"],
	},
	{
		id: "p4",
		title: "Signature Pocket Tee",
		price: "$36",
		image: "/assets/products/tee-4.jpg",
		tags: ["Classic", "Fit"],
	},
];

export default function LandingPage() {
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<Product | null>(null);
	const [tryOnOpen, setTryOnOpen] = useState(false);

	const filtered = useMemo(
		() =>
			SAMPLE_PRODUCTS.filter(
				(p) =>
					p.title.toLowerCase().includes(query.toLowerCase()) ||
					(p.tags || [])
						.join(" ")
						.toLowerCase()
						.includes(query.toLowerCase())
			),
		[query]
	);

	function openTryOn(p: Product) {
		setSelected(p);
		setTryOnOpen(true);
	}

	function viewProduct(p: Product) {
		// stub: navigate to product detail route in your router
		alert(`Open product: ${p.title}`);
	}

	return (
		<main className="min-h-screen bg-white text-black py-12">
			<div className="container mx-auto px-6">
				{/* Hero */}
				<section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
					<div>
						<h1 className="text-4xl font-bold leading-tight">
							Discover premium T‑shirt designs — try them on with AI.
						</h1>
						<p className="mt-4 text-lg text-black/70 max-w-xl">
							Black typography · White canvas · Clean minimal experience. Browse
							curated designs from our community of designers and preview how they
							look on you using our AI Try‑On.
						</p>

						<div className="mt-6 flex gap-3">
							<button
								onClick={() => setTryOnOpen(true)}
								className="bg-black text-white rounded-lg px-5 py-3 font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
							>
								Launch AI Try‑On
							</button>
							<button
								onClick={() =>
									window.scrollTo({ top: 600, behavior: "smooth" })
								}
								className="border border-black rounded-lg px-5 py-3 font-semibold"
							>
								Explore Designs
							</button>
						</div>
					</div>

					<div className="rounded-xl border p-4">
						<div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
							<img
								src="/assets/hero/hero-tee.jpg"
								alt="Hero tee"
								className="object-cover w-full h-full"
							/>
						</div>
					</div>
				</section>

				{/* Search / Filters */}
				<section className="mt-12">
					<div className="flex items-center justify-between gap-4">
						<label className="flex-1">
							<input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search designs, tags, or designers"
								className="w-full border border-black/10 rounded-lg px-4 py-3 text-black"
								aria-label="Search designs"
							/>
						</label>

						<div className="hidden md:flex gap-3">
							<button className="nav-pill">All</button>
							<button className="nav-pill">Minimal</button>
							<button className="nav-pill">Vintage</button>
							<button className="nav-pill">Art</button>
						</div>
					</div>
				</section>

				{/* Product Grid */}
				<section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{filtered.map((p) => (
						<ProductCard
							key={p.id}
							product={p}
							onTryOn={openTryOn}
							onView={viewProduct}
						/>
					))}
				</section>
			</div>

			{/* TryOn modal: pass selected product or null */}
			<TryOnModal
				open={tryOnOpen}
				onClose={() => {
					setTryOnOpen(false);
					setSelected(null);
				}}
				product={selected}
			/>
		</main>
	);
}