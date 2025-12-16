import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Store pages
import Index from "./pages/Index";
import ShopPage from "./pages/ShopPage";
import VirtualTryOnPage from "./pages/VirtualTryOnPage";
import AboutPage from "./pages/AboutPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import NotFound from "./pages/NotFound";

// Auth pages
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import AdminLoginPage from "./pages/Auth/AdminLoginPage";

// Admin imports
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminDesigns from "./pages/admin/AdminDesigns";
import AdminDesigners from "./pages/admin/AdminDesigners";
import AdminProductsPage from "./pages/admin/AdminProductsPage";

// Designer imports
import { DesignerLayout } from "./components/designer/DesignerLayout";
import DesignerDashboard from "./pages/designer/DesignerDashboard";
import DesignerDesigns from "./pages/designer/DesignerDesigns";
import DesignerSales from "./pages/designer/DesignerSales";
import DesignerWallet from "./pages/designer/DesignerWallet";

const queryClient = new QueryClient();

// Protected Route component
function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(user?.role || '')) {
    // Redirect based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'designer') {
      return <Navigate to="/designer" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Auth Route - redirect if already logged in
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'designer') {
      return <Navigate to="/designer" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    {/* Public store routes */}
    <Route path="/" element={<Index />} />
    <Route path="/shop" element={<ShopPage />} />
    <Route path="/virtual-try-on" element={<VirtualTryOnPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/product/:id" element={<ProductDetailPage />} />

    {/* Auth routes */}
    <Route path="/auth/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
    <Route path="/auth/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
    <Route path="/auth/admin" element={<AuthRoute><AdminLoginPage /></AuthRoute>} />

    {/* Admin routes - admin only */}
    <Route path="/admin" element={
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    }>
      <Route index element={<AdminDashboard />} />
      <Route path="products" element={<AdminProductsPage />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="designs" element={<AdminDesigns />} />
      <Route path="designers" element={<AdminDesigners />} />
    </Route>

    {/* Designer routes - designer and admin */}
    <Route path="/designer" element={
      <ProtectedRoute allowedRoles={['designer', 'admin']}>
        <DesignerLayout />
      </ProtectedRoute>
    }>
      <Route index element={<DesignerDashboard />} />
      <Route path="designs" element={<DesignerDesigns />} />
      <Route path="sales" element={<DesignerSales />} />
      <Route path="wallet" element={<DesignerWallet />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
