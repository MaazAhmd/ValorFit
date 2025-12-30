import { authFetch } from "./authService";
import { API_BASE } from "@/config/api";

export async function getCart() {
  const res = await authFetch(`${API_BASE}/api/cart/`);
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json(); // { items: [...] }
}

export async function addToCart(productId: string, quantity = 1) {
  const res = await authFetch(`${API_BASE}/api/cart/add`, {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
}

export async function removeFromCart(itemId: string) {
  const res = await authFetch(`${API_BASE}/api/cart/remove`, {
    method: "POST",
    body: JSON.stringify({ item_id: itemId }),
  });
  if (!res.ok) throw new Error("Failed to remove from cart");
  return res.json();
}