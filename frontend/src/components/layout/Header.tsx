import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, Package } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout, isAdmin, isDesigner } = useAuth();
  const navigate = useNavigate();

  // Different nav links based on user role
  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { name: 'Dashboard', href: '/admin' },
        { name: 'Products', href: '/admin/products' },
        { name: 'Orders', href: '/admin/orders' },
        { name: 'Designs', href: '/admin/designs' },
        { name: 'Designers', href: '/admin/designers' },
      ];
    }
    if (isDesigner) {
      return [
        { name: 'Dashboard', href: '/designer' },
        { name: 'My Designs', href: '/designer/designs' },
        { name: 'Wallet', href: '/designer/wallet' },
      ];
    }
    // Customer/guest navigation
    return [
      { name: 'Shop All', href: '/shop' },
      { name: 'Designer', href: '/shop?category=designer' },
      { name: 'Virtual Try-On', href: '/virtual-try-on' },
      { name: 'About', href: '/about' },
    ];
  };

  const navLinks = getNavLinks();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={isAdmin ? '/admin' : isDesigner ? '/designer' : '/'} className="font-display text-2xl tracking-wider text-foreground hover:text-primary transition-smooth">
          VALOR<span className="text-primary">FIT</span>
          {isAdmin && <span className="text-xs text-muted-foreground ml-2 uppercase tracking-wider">Admin</span>}
          {isDesigner && !isAdmin && <span className="text-xs text-muted-foreground ml-2 uppercase tracking-wider">Designer</span>}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth uppercase tracking-wider"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Cart, Auth & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Cart - only show for customers */}
          {!isAdmin && !isDesigner && (
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {/* Auth */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-primary capitalize">{user.role}</p>
                </div>
                <DropdownMenuSeparator />
                {!isAdmin && !isDesigner && (
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <Package className="h-4 w-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth/login" className="hidden md:block">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-slide-up">
          <div className="container mx-auto px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block text-lg font-medium text-muted-foreground hover:text-foreground transition-smooth uppercase tracking-wider py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-border">
              {isAuthenticated && user ? (
                <>
                  <div className="py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  {!isAdmin && !isDesigner && (
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 py-2 text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block py-2 text-red-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth/login"
                  className="block py-2 text-primary font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
