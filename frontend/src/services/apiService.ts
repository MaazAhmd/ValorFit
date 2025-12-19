import { toast } from '@/hooks/use-toast';

const API_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

class ApiService {
  // Auth
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  }

  async adminLogin(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  }

  async register(name: string, email: string, password: string, role: string = 'customer') {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    return handleResponse(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  }

  // Products
  async getProducts(category?: string) {
    let url = `${API_URL}/products`;
    if (category) {
      url += `?category=${category}`;
    }
    const response = await fetch(url);
    return handleResponse(response);
  }

  async getProduct(id: string) {
    const response = await fetch(`${API_URL}/products/${id}`);
    return handleResponse(response);
  }

  async createProduct(productData: any) {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  }

  async updateProduct(id: number, productData: any) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  }

  async deleteProduct(id: number) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  }

  async getAllProducts() {
    // Admin endpoint usually, or just regular getProducts
    const response = await fetch(`${API_URL}/products`);
    return handleResponse(response);
  }

  // Orders
  async createOrder(orderData: any) {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  }

  async getOrders() {
    const response = await fetch(`${API_URL}/orders`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  }

  async getAllOrders() { // Admin
    const response = await fetch(`${API_URL}/admin/orders`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  }

  async updateOrderStatus(orderId: number, status: string) {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  }

  // Designs
  async getDesigns() {
    const response = await fetch(`${API_URL}/designs`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  }

  async createDesign(designData: any) {
    const response = await fetch(`${API_URL}/designs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(designData),
    });
    return handleResponse(response);
  }

  // Create design with image file upload
  async createDesignWithImage(designData: any, imageFile?: File) {
    let imageUrl = designData.image;

    // If an image file is provided, upload it first
    if (imageFile) {
      const uploadResult = await this.uploadDesignImage(imageFile);
      imageUrl = uploadResult.image_url;
    }

    const response = await fetch(`${API_URL}/designs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...designData, image: imageUrl }),
    });
    return handleResponse(response);
  }

  // Designer Stats
  async getDesignerStats(dateFrom?: string, dateTo?: string) {
    let url = `${API_URL}/designer/stats`;
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  }

  // Admin Stats
  async getAdminStats() {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  }

  async getDesigners() {
    const response = await fetch(`${API_URL}/admin/designers`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  }

  // Upload Methods for Local Storage
  async uploadProductImage(file: File): Promise<{ image_url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/uploads/product`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    return handleResponse(response);
  }

  async uploadDesignImage(file: File): Promise<{ image_url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/uploads/design`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    return handleResponse(response);
  }

  // Create product with image file upload
  async createProductWithImage(productData: any, imageFile?: File) {
    let imageUrl = productData.image;

    // If an image file is provided, upload it first
    if (imageFile) {
      const uploadResult = await this.uploadProductImage(imageFile);
      imageUrl = uploadResult.image_url;
    }

    // Create the product with the image URL
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...productData, image: imageUrl }),
    });
    return handleResponse(response);
  }

  // Update product with optional image file upload
  async updateProductWithImage(id: number, productData: any, imageFile?: File) {
    let imageUrl = productData.image;

    // If an image file is provided, upload it first
    if (imageFile) {
      const uploadResult = await this.uploadProductImage(imageFile);
      imageUrl = uploadResult.image_url;
    }

    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ ...productData, image: imageUrl }),
    });
    return handleResponse(response);
  }
}

export const apiService = new ApiService();
export default apiService;
