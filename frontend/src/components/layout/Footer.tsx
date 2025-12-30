import { Link } from 'react-router-dom';
import { Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl tracking-wider">
              VALOR<span className="text-primary">FIT</span>
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Premium gym and athletic apparel for those who push their limits.
              Crafted for performance, worn with pride.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="font-display text-lg tracking-wider">SHOP</h4>
            <div className="space-y-2">
              <Link to="/shop" className="block text-sm text-muted-foreground hover:text-foreground transition-smooth">
                All Compression Shirts
              </Link>
              <Link to="/shop?category=normal" className="block text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Classic Collection
              </Link>
              <Link to="/shop?category=designer" className="block text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Designer Series
              </Link>
              <Link to="/virtual-try-on" className="block text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Virtual Try-On
              </Link>
            </div>
          </div>

          {/* Help */}
          <div className="space-y-4">
            <h4 className="font-display text-lg tracking-wider">HELP</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Shipping & Returns
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Size Guide
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Contact Us
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-smooth">
                FAQ
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-display text-lg tracking-wider">STAY UPDATED</h4>
            <p className="text-sm text-muted-foreground">
              Get exclusive drops and early access.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-secondary border border-border px-4 py-2 text-sm focus:outline-none focus:border-primary transition-smooth"
              />
              <button className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider hover:bg-primary/90 transition-smooth">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 ValorFit. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-smooth">Privacy</a>
            <a href="#" className="hover:text-foreground transition-smooth">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
