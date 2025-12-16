-- =====================================================
-- T-Shirt E-Commerce Supabase Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'designer', 'admin')),
    avatar_url TEXT,
    wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    category TEXT NOT NULL DEFAULT 'normal' CHECK (category IN ('normal', 'designer')),
    description TEXT,
    image TEXT NOT NULL,
    images TEXT[],
    sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'],
    colors JSONB DEFAULT '[]'::JSONB,
    designer_id UUID REFERENCES public.users(id),
    designer_name TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can view active products
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = TRUE);

-- Admins can manage all products
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- DESIGNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.designs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    designer_id UUID NOT NULL REFERENCES public.users(id),
    image TEXT NOT NULL,
    category TEXT DEFAULT 'designer',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sales INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0.00
);

-- Enable RLS
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- Designers can view and manage their own designs
CREATE POLICY "Designers can view own designs" ON public.designs
    FOR SELECT USING (auth.uid() = designer_id);

CREATE POLICY "Designers can insert own designs" ON public.designs
    FOR INSERT WITH CHECK (auth.uid() = designer_id);

CREATE POLICY "Designers can update own designs" ON public.designs
    FOR UPDATE USING (auth.uid() = designer_id);

-- Admins can manage all designs
CREATE POLICY "Admins can manage all designs" ON public.designs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id),
    items JSONB NOT NULL DEFAULT '[]'::JSONB,
    total DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage all orders
CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- TRANSACTIONS TABLE (Designer Wallet)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id),
    type TEXT NOT NULL CHECK (type IN ('earning', 'withdrawal', 'pending')),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create withdrawal requests
CREATE POLICY "Users can create transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage all transactions
CREATE POLICY "Admins can manage all transactions" ON public.transactions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- SEED DATA: Products
-- =====================================================
INSERT INTO public.products (name, price, original_price, category, description, image, sizes, colors, is_featured, is_new) VALUES
('Midnight Essence', 49.00, NULL, 'normal', 'Premium cotton tee with minimalist design. Perfect for everyday wear.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop', ARRAY['S', 'M', 'L', 'XL', 'XXL'], '[{"name": "Black", "hex": "#0a0a0a"}, {"name": "Charcoal", "hex": "#2d2d2d"}]'::JSONB, TRUE, FALSE),
('Urban Edge', 55.00, 70.00, 'normal', 'Street-ready style with premium quality fabric.', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop', ARRAY['S', 'M', 'L', 'XL'], '[{"name": "White", "hex": "#f5f5f5"}, {"name": "Grey", "hex": "#6b6b6b"}]'::JSONB, FALSE, TRUE),
('Neon Dreams', 120.00, NULL, 'designer', 'Limited edition designer piece featuring neon accents and unique graphics.', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop', ARRAY['S', 'M', 'L', 'XL'], '[{"name": "Black", "hex": "#0a0a0a"}]'::JSONB, TRUE, FALSE),
('Void Walker', 150.00, NULL, 'designer', 'Abstract geometric patterns meet luxury streetwear.', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop', ARRAY['M', 'L', 'XL'], '[{"name": "Obsidian", "hex": "#1a1a1a"}, {"name": "Smoke", "hex": "#3d3d3d"}]'::JSONB, TRUE, TRUE),
('Classic Raw', 45.00, NULL, 'normal', 'Timeless design with raw edge details.', 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=800&fit=crop', ARRAY['S', 'M', 'L', 'XL', 'XXL'], '[{"name": "Black", "hex": "#0a0a0a"}, {"name": "Navy", "hex": "#1a1a2e"}, {"name": "Forest", "hex": "#1a2e1a"}]'::JSONB, FALSE, FALSE),
('Digital Flux', 135.00, NULL, 'designer', 'Digital art meets fashion in this exclusive designer collaboration.', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=800&fit=crop', ARRAY['S', 'M', 'L'], '[{"name": "Black", "hex": "#0a0a0a"}]'::JSONB, FALSE, FALSE),
('Shadow Line', 52.00, NULL, 'normal', 'Subtle shadow print on premium cotton blend.', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&h=800&fit=crop', ARRAY['S', 'M', 'L', 'XL'], '[{"name": "Slate", "hex": "#4a4a4a"}, {"name": "Onyx", "hex": "#121212"}]'::JSONB, FALSE, FALSE),
('Essential Noir', 42.00, NULL, 'normal', 'The essential black tee, perfected.', 'https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=600&h=800&fit=crop', ARRAY['S', 'M', 'L', 'XL', 'XXL'], '[{"name": "Black", "hex": "#0a0a0a"}]'::JSONB, TRUE, FALSE),
('Pulse', 48.00, NULL, 'normal', 'Dynamic comfort for an active lifestyle.', 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&h=800&fit=crop', ARRAY['S', 'M', 'L', 'XL'], '[{"name": "Dark Grey", "hex": "#333333"}, {"name": "Black", "hex": "#0a0a0a"}]'::JSONB, FALSE, FALSE),
('Ethereal', 195.00, NULL, 'designer', 'Where dreams meet fabric. A designer masterpiece.', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop', ARRAY['S', 'M', 'L'], '[{"name": "Phantom", "hex": "#1f1f1f"}]'::JSONB, TRUE, FALSE);

-- =====================================================
-- FUNCTION: Handle new user signup
-- Automatically creates user profile when auth user is created
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- CREATE ADMIN USER
-- Note: You need to create this user via Supabase Auth first,
-- then update their role here
-- =====================================================
-- After creating admin user via Auth, run:
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@tshirt.com';
