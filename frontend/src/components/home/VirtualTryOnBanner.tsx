import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Wand2 } from 'lucide-react';

const VirtualTryOnBanner = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary uppercase tracking-wider">New Feature</span>
            </div>

            <h2 className="font-display text-5xl md:text-7xl">
              VIRTUAL
              <br />
              <span className="text-gradient">TRY-ON</span>
            </h2>

            <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
              See how our tees look on you before buying.
              Upload your photo and experience the future of online shopping.
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Upload Photo</h4>
                  <p className="text-sm text-muted-foreground">Use any front-facing photo</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary flex items-center justify-center shrink-0">
                  <Wand2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">AI Powered</h4>
                  <p className="text-sm text-muted-foreground">Realistic fit visualization</p>
                </div>
              </div>
            </div>

            <Link to="/virtual-try-on">
              <Button variant="hero" className="animate-pulse-glow">
                Try It Now
              </Button>
            </Link>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Phone mockup */}
              <div className="absolute inset-0 bg-gradient-card rounded-3xl border border-border p-4">
                <div className="w-full h-full bg-secondary rounded-2xl overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop"
                    alt="Virtual Try-On Demo"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay Compression shirt indicator */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-background/80 backdrop-blur-sm px-6 py-3 border border-primary/50">
                      <span className="text-primary font-display text-lg">MIDNIGHT ESSENCE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl animate-float" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualTryOnBanner;
