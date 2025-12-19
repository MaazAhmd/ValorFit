import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "You're in!",
        description: "Welcome to the ValorFit family. Stay tuned for exclusive drops.",
      });
      setEmail('');
    }
  };

  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, hsl(var(--primary)) 25%, transparent 25%), 
                           linear-gradient(-45deg, hsl(var(--primary)) 25%, transparent 25%), 
                           linear-gradient(45deg, transparent 75%, hsl(var(--primary)) 75%), 
                           linear-gradient(-45deg, transparent 75%, hsl(var(--primary)) 75%)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-primary uppercase tracking-[0.3em] text-sm font-medium">
            Join The Movement
          </span>
          <h2 className="font-display text-5xl md:text-6xl mt-4 mb-6">
            GET EARLY ACCESS
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Be the first to know about new drops, exclusive offers, and limited editions.
            No spam, just heat.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-secondary border border-border px-6 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-smooth"
              required
            />
            <Button variant="default" size="lg" type="submit">
              Subscribe
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
