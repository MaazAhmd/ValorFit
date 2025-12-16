import { LayoutDashboard, Package, Palette, Users, LogOut, Menu, ShoppingBag } from 'lucide-react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Products', url: '/admin/products', icon: ShoppingBag },
  { title: 'Orders', url: '/admin/orders', icon: Package },
  { title: 'Designs', url: '/admin/designs', icon: Palette },
  { title: 'Designers', url: '/admin/designers', icon: Users },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen bg-card border-r border-border transition-all duration-300",
        collapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0 w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            {!collapsed && (
              <span className="font-display text-xl text-primary">ADMIN</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <RouterNavLink
                  key={item.title}
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </RouterNavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <RouterNavLink
              to="/"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Back to Store</span>}
            </RouterNavLink>
          </div>
        </div>
      </aside>

      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-30 lg:hidden"
        onClick={() => setCollapsed(false)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
}
