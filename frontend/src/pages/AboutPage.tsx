import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const AboutPage = () => {
  const team = [
    {
      name: 'Marcus Chen',
      role: 'Founder & Creative Director',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
    },
    {
      name: 'Elena Voronova',
      role: 'Head of Design',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
    },
    {
      name: 'James Okonkwo',
      role: 'Production Lead',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
    },
  ];

  const values = [
    {
      title: 'Quality First',
      description: 'Every tee is crafted from 100% premium cotton, garment-dyed for lasting comfort and color.',
    },
    {
      title: 'Sustainable Future',
      description: 'We use eco-friendly dyes and ethical manufacturing processes to minimize our footprint.',
    },
    {
      title: 'Designer Collaboration',
      description: 'We partner with emerging and established artists to create unique, wearable art.',
    },
    {
      title: 'Community Driven',
      description: 'Our customers inspire our designs. We listen, adapt, and create for you.',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-24 bg-card relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <span className="text-primary uppercase tracking-[0.3em] text-sm font-medium">
              Our Story
            </span>
            <h1 className="font-display text-6xl md:text-8xl mt-4">
              ABOUT<br />
              <span className="text-gradient">VALORFIT</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
              Born from a passion for premium athletic wear and the pursuit of excellence.
              We create more than apparel — we craft performance gear for champions.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="font-display text-5xl">
                  THE<br />BEGINNING
                </h2>
                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p>
                    ValorFit was founded in 2020, in a fitness community in Los Angeles.
                    What started as a passion project between athletes who believed that
                    gym wear could be something more — a statement of dedication,
                    a symbol of your commitment to excellence.
                  </p>
                  <p>
                    We saw a gap in the market: athletic wear that didn't compromise on quality,
                    designs that looked great in and out of the gym, and a brand that
                    truly understood the fitness community.
                  </p>
                  <p>
                    Today, we've grown from that small community to a global brand, but our
                    mission remains the same: create premium athletic apparel that helps you
                    perform your best.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] bg-card overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=1000&fit=crop"
                    alt="Our workshop"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary/20 blur-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-primary uppercase tracking-[0.3em] text-sm font-medium">
                What We Stand For
              </span>
              <h2 className="font-display text-5xl mt-4">OUR VALUES</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className="p-8 bg-background border border-border hover:border-primary transition-smooth group"
                >
                  <span className="font-display text-5xl text-primary/30 group-hover:text-primary/50 transition-smooth">
                    0{index + 1}
                  </span>
                  <h3 className="font-display text-2xl mt-4 mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-primary uppercase tracking-[0.3em] text-sm font-medium">
                Meet The Team
              </span>
              <h2 className="font-display text-5xl mt-4">THE FACES BEHIND VALORFIT</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {team.map((member) => (
                <div key={member.name} className="text-center group">
                  <div className="aspect-square bg-card overflow-hidden mb-6">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <h3 className="font-display text-xl">{member.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-card">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-5xl md:text-6xl mb-6">
              JOIN THE<br />
              <span className="text-gradient">MOVEMENT</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Explore our collection and find your next statement piece.
            </p>
            <Link to="/shop">
              <Button variant="hero" className="group">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;
