// Dummy data for admin and designer dashboards

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  designerName: string;
  quantity: number;
  price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  shippingAddress: string;
}

export interface Design {
  id: string;
  name: string;
  designerId: string;
  designerName: string;
  image: string;
  category: 'classic' | 'designer';
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: string;
  sales: number;
  revenue: number;
}

export interface Designer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  totalDesigns: number;
  totalSales: number;
  totalEarnings: number;
  walletBalance: number;
  joinDate: string;
}

export interface SalesData {
  month: string;
  sales: number;
  revenue: number;
}

export interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'pending';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export const orders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    productName: 'Urban Edge Tee',
    designerName: 'Alex Rivera',
    quantity: 2,
    price: 89.98,
    status: 'delivered',
    date: '2024-01-15',
    shippingAddress: '123 Main St, New York, NY 10001'
  },
  {
    id: 'ORD-002',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@example.com',
    productName: 'Neon Dreams',
    designerName: 'Maya Chen',
    quantity: 1,
    price: 54.99,
    status: 'shipped',
    date: '2024-01-16',
    shippingAddress: '456 Oak Ave, Los Angeles, CA 90001'
  },
  {
    id: 'ORD-003',
    customerName: 'Mike Davis',
    customerEmail: 'mike@example.com',
    productName: 'Minimalist Black',
    designerName: 'ValorFit Studio',
    quantity: 3,
    price: 104.97,
    status: 'processing',
    date: '2024-01-17',
    shippingAddress: '789 Pine Rd, Chicago, IL 60601'
  },
  {
    id: 'ORD-004',
    customerName: 'Emily Brown',
    customerEmail: 'emily@example.com',
    productName: 'Abstract Flow',
    designerName: 'Alex Rivera',
    quantity: 1,
    price: 59.99,
    status: 'pending',
    date: '2024-01-18',
    shippingAddress: '321 Elm St, Houston, TX 77001'
  },
  {
    id: 'ORD-005',
    customerName: 'Chris Wilson',
    customerEmail: 'chris@example.com',
    productName: 'Geometric Pulse',
    designerName: 'Jordan Lee',
    quantity: 2,
    price: 129.98,
    status: 'delivered',
    date: '2024-01-14',
    shippingAddress: '654 Maple Dr, Phoenix, AZ 85001'
  }
];

export const designs: Design[] = [
  {
    id: 'DES-001',
    name: 'Urban Edge',
    designerId: 'designer-1',
    designerName: 'Alex Rivera',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
    category: 'designer',
    status: 'approved',
    uploadDate: '2024-01-01',
    sales: 45,
    revenue: 2024.55
  },
  {
    id: 'DES-002',
    name: 'Neon Dreams',
    designerId: 'designer-2',
    designerName: 'Maya Chen',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',
    category: 'designer',
    status: 'approved',
    uploadDate: '2024-01-05',
    sales: 32,
    revenue: 1759.68
  },
  {
    id: 'DES-003',
    name: 'Abstract Flow',
    designerId: 'designer-1',
    designerName: 'Alex Rivera',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'designer',
    status: 'approved',
    uploadDate: '2024-01-10',
    sales: 28,
    revenue: 1679.72
  },
  {
    id: 'DES-004',
    name: 'Geometric Pulse',
    designerId: 'designer-3',
    designerName: 'Jordan Lee',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400',
    category: 'designer',
    status: 'pending',
    uploadDate: '2024-01-18',
    sales: 0,
    revenue: 0
  },
  {
    id: 'DES-005',
    name: 'Retro Wave',
    designerId: 'designer-2',
    designerName: 'Maya Chen',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400',
    category: 'designer',
    status: 'rejected',
    uploadDate: '2024-01-12',
    sales: 0,
    revenue: 0
  }
];

export const currentDesigner: Designer = {
  id: 'designer-1',
  name: 'Alex Rivera',
  email: 'alex@designer.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
  totalDesigns: 12,
  totalSales: 156,
  totalEarnings: 4250.50,
  walletBalance: 1850.25,
  joinDate: '2023-06-15'
};

export const salesData: SalesData[] = [
  { month: 'Aug', sales: 120, revenue: 5400 },
  { month: 'Sep', sales: 145, revenue: 6525 },
  { month: 'Oct', sales: 180, revenue: 8100 },
  { month: 'Nov', sales: 220, revenue: 9900 },
  { month: 'Dec', sales: 310, revenue: 13950 },
  { month: 'Jan', sales: 280, revenue: 12600 }
];

export const designerSalesData: SalesData[] = [
  { month: 'Aug', sales: 15, revenue: 67.50 },
  { month: 'Sep', sales: 22, revenue: 99.00 },
  { month: 'Oct', sales: 28, revenue: 126.00 },
  { month: 'Nov', sales: 35, revenue: 157.50 },
  { month: 'Dec', sales: 42, revenue: 189.00 },
  { month: 'Jan', sales: 38, revenue: 171.00 }
];

export const transactions: Transaction[] = [
  {
    id: 'TXN-001',
    type: 'earning',
    amount: 45.00,
    description: 'Commission from Urban Edge sales',
    date: '2024-01-18',
    status: 'completed'
  },
  {
    id: 'TXN-002',
    type: 'withdrawal',
    amount: -500.00,
    description: 'Withdrawal to bank account',
    date: '2024-01-15',
    status: 'completed'
  },
  {
    id: 'TXN-003',
    type: 'earning',
    amount: 32.50,
    description: 'Commission from Abstract Flow sales',
    date: '2024-01-14',
    status: 'completed'
  },
  {
    id: 'TXN-004',
    type: 'pending',
    amount: 28.00,
    description: 'Pending commission - processing',
    date: '2024-01-17',
    status: 'pending'
  }
];

export const getDesignerDesigns = (designerId: string) => {
  return designs.filter(d => d.designerId === designerId);
};

export const getOrdersByStatus = (status: Order['status']) => {
  return orders.filter(o => o.status === status);
};
