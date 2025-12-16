import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xohmlxpcsxconcaetbfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvaG1seHBjc3hjb25jYWV0YmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NzY4MzAsImV4cCI6MjA4MTQ1MjgzMH0.eEa_yaO11xEAR-WG-B2d4EDNB6GqpduZjNVPGvJaQrk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (to be generated with supabase gen types)
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    name: string;
                    email: string;
                    role: 'customer' | 'designer' | 'admin';
                    avatar_url: string | null;
                    wallet_balance: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    email: string;
                    role?: 'customer' | 'designer' | 'admin';
                    avatar_url?: string | null;
                    wallet_balance?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    email?: string;
                    role?: 'customer' | 'designer' | 'admin';
                    avatar_url?: string | null;
                    wallet_balance?: number;
                    created_at?: string;
                };
            };
            products: {
                Row: {
                    id: number;
                    name: string;
                    price: number;
                    original_price: number | null;
                    category: 'normal' | 'designer';
                    description: string | null;
                    image: string;
                    images: string[] | null;
                    sizes: string[];
                    colors: { name: string; hex: string }[];
                    designer_id: string | null;
                    designer_name: string | null;
                    is_featured: boolean;
                    is_new: boolean;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['products']['Insert']>;
            };
            designs: {
                Row: {
                    id: number;
                    name: string;
                    designer_id: string;
                    image: string;
                    category: string;
                    status: 'pending' | 'approved' | 'rejected';
                    rejection_reason: string | null;
                    upload_date: string;
                    sales: number;
                    revenue: number;
                };
                Insert: Omit<Database['public']['Tables']['designs']['Row'], 'id' | 'upload_date' | 'sales' | 'revenue'>;
                Update: Partial<Database['public']['Tables']['designs']['Insert']>;
            };
            orders: {
                Row: {
                    id: number;
                    user_id: string;
                    items: any[];
                    total: number;
                    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
                    shipping_address: string;
                    customer_name: string;
                    customer_email: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['orders']['Insert']>;
            };
            transactions: {
                Row: {
                    id: number;
                    user_id: string;
                    type: 'earning' | 'withdrawal' | 'pending';
                    amount: number;
                    description: string | null;
                    status: 'completed' | 'pending' | 'failed';
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
            };
        };
    };
}
