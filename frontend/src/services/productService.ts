import { authFetch } from "./authService";
import { Product } from "@/context/CartContext";
import { API_BASE } from "@/config/api";

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products/`);
    if (!res.ok) throw new Error("backend fetch failed");
    const data = await res.json();
    return data.products || [];
  } catch (e) {
    console.warn("getProducts failed:", e);
    return [];
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/api/products/${id}`);
    if (!res.ok) throw new Error("not found");
    const data = await res.json();
    return data.product || null;
  } catch (e) {
    console.warn("getProduct failed:", e);
    return null;
  }
}

export async function createProduct(data: Partial<Product>) {
  const res = await authFetch(`${API_BASE}/api/products/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const res = await authFetch(`${API_BASE}/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await authFetch(`${API_BASE}/api/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products/featured`);
    if (!res.ok) throw new Error("backend fetch failed");
    const data = await res.json();
    return data.products || [];
  } catch (e) {
    console.warn("getFeaturedProducts failed:", e);
    return [];
  }
}