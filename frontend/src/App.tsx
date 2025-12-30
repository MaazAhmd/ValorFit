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
import MyOrdersPage from "./pages/MyOrdersPage";
import CustomDesignPage from "./pages/CustomDesignPage";
import MyCustomDesigns from "./pages/MyCustomDesigns";
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

// Customer Only Route - prevents admins and designers from accessing store pages
function CustomerOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is admin, redirect to admin dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // If user is designer, redirect to designer dashboard
  if (isAuthenticated && user?.role === 'designer') {
    return <Navigate to="/designer" replace />;
  }

  // Allow access for customers and non-authenticated users
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    {/* Public store routes - customers only */}
    <Route path="/" element={<CustomerOnlyRoute><Index /></CustomerOnlyRoute>} />
    <Route path="/shop" element={<CustomerOnlyRoute><ShopPage /></CustomerOnlyRoute>} />
    <Route path="/virtual-try-on" element={<CustomerOnlyRoute><VirtualTryOnPage /></CustomerOnlyRoute>} />
    <Route path="/about" element={<CustomerOnlyRoute><AboutPage /></CustomerOnlyRoute>} />
    <Route path="/cart" element={<CustomerOnlyRoute><CartPage /></CustomerOnlyRoute>} />
    <Route path="/checkout" element={<CustomerOnlyRoute><CheckoutPage /></CustomerOnlyRoute>} />
    <Route path="/product/:id" element={<CustomerOnlyRoute><ProductDetailPage /></CustomerOnlyRoute>} />
    <Route path="/orders" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <MyOrdersPage />
      </ProtectedRoute>
    } />
    <Route path="/custom-design" element={<CustomerOnlyRoute><CustomDesignPage /></CustomerOnlyRoute>} />
    <Route path="/my-designs" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <MyCustomDesigns />
      </ProtectedRoute>
    } />

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

    {/* Designer routes - designer only (not admin) */}
    <Route path="/designer" element={
      <ProtectedRoute allowedRoles={['designer']}>
        <DesignerLayout />
      </ProtectedRoute>
    }>
      <Route index element={<DesignerDashboard />} />
      <Route path="designs" element={<DesignerDesigns />} />
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
