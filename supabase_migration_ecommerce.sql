-- =====================================================
-- E-Commerce Features Migration
-- Run this in Supabase SQL Editor AFTER the initial schema
-- =====================================================

-- Add quantity field to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 10;

-- Add payment fields to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Update existing products with default quantity
UPDATE public.products SET quantity = 10 WHERE quantity IS NULL;

-- Allow admins to insert/update/delete products
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Allow admins to view all orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Allow authenticated users to create orders
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Authenticated users can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update product quantity (for purchases)
CREATE POLICY "Authenticated can update product quantity" ON public.products
    FOR UPDATE USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- IMPORTANT: Run the initial supabase_schema.sql first!
-- Then run this migration file.
-- =====================================================
