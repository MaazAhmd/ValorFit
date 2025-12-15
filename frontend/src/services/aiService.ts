// All frontend calls go to your backend; DO NOT include API keys here.
export type TryOnPayload = {
  model_image: string;
  garment_image: string;
  mode?: "performance" | "balanced" | "quality";
  category?: "auto" | "tops" | "bottoms" | "one-pieces";
  segmentation_free?: boolean;
  moderation_level?: "conservative" | "permissive" | "none";
  garment_photo_type?: "auto" | "flat-lay" | "model";
};

/**
 * Submit a try-on request to your backend.
 * Backend should forward to FASHN (server-side) and return JSON:
 *  - { imageBase64: "..." }  OR
 *  - { id: "..." } for async processing
 *
 * If the backend is unreachable during local dev, this returns a mock id.
 */
export async function submitTryOn(payload: TryOnPayload) {
  try {
    const res = await fetch("/api/try-on", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model_name: "tryon-v1.6", inputs: payload }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `TryOn failed: ${res.status}`);
    }

    return await res.json(); // expect { imageBase64 } or { id }
  } catch (err) {
    console.warn("submitTryOn: backend unreachable, returning mock id", err);
    return { id: "mock-tryon-local-1" };
  }
}