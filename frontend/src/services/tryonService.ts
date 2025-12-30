import { authFetch, getToken } from "./authService";
import { API_BASE } from "@/config/api";

export type TryOnResponse = {
  image_url?: string;
  tryon_id?: number;
  message?: string;
};

// Generates a try-on image for the selected product and user photo.
export async function generateTryOn(
  userPhotoFile: File,
  productId: string
): Promise<TryOnResponse> {
  const token = getToken();
  if (!token) throw new Error("You must be logged in");

  const formData = new FormData();
  formData.append("user_photo", userPhotoFile);
  formData.append("product_id", productId);

  const res = await fetch(`${API_BASE}/api/tryon/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = text; }

  if (!res.ok) throw new Error(json?.message || json?.error || "Try-on failed");
  return json;
}

export async function getTryOnHistory() {
  const res = await authFetch(`${API_BASE}/api/tryon/history`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function deleteTryOn(tryOnId: number) {
  const res = await authFetch(`${API_BASE}/api/tryon/${tryOnId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}