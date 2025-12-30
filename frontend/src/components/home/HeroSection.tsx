import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Accent Glow */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <span className="inline-block text-primary uppercase tracking-[0.3em] text-sm font-medium">
                Performance Collection 2024
              </span>
              <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-none">
                PUSH YOUR
                <br />
                <span className="text-gradient">LIMITS</span>
              </h1>
            </div>

            <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
              Premium gym and athletic apparel crafted for those who never quit.
              Performance meets style, strength meets comfort.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button variant="hero" className="group">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/virtual-try-on">
                <Button variant="hero-outline">
                  Try On Virtually
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-12 pt-8 border-t border-border/50">
              <div>
                <div className="font-display text-3xl text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Unique Designs</div>
              </div>
              <div>
                <div className="font-display text-3xl text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <div className="font-display text-3xl text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Premium Cotton</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block">
            <div className="relative z-10 animate-float">
              <img
                src="/assets/hero/valorfit-hero.png"
                alt="Premium Gym Compression Shirt"
                className="w-full max-w-md mx-auto shadow-2xl rounded-lg"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-primary/20 rotate-6" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-primary/10 -rotate-3" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-muted-foreground to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
