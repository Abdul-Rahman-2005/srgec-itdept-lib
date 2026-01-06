import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Clock, Search, Shield, Award } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Vast Collection',
      description: 'Access thousands of books across various disciplines and subjects.',
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Separate portals for students, faculty, and librarians.',
    },
    {
      icon: Clock,
      title: '6-Month Borrowing',
      description: 'Extended borrowing period with timely SMS reminders.',
    },
    {
      icon: Search,
      title: 'Easy Search',
      description: 'Find books quickly with our powerful search system.',
    },
    {
      icon: Shield,
      title: 'Secure System',
      description: 'Role-based authentication ensures data security.',
    },
    {
      icon: Award,
      title: 'Quality Resources',
      description: 'Curated collection of academic and reference materials.',
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full text-primary-foreground/90 text-sm mb-6 animate-fade-in">
              <BookOpen className="w-4 h-4" />
              Welcome to IT Department Library
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-primary-foreground mb-6 animate-slide-up">
              Discover Knowledge,
              <br />
              <span className="text-gradient">Empower Learning</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-slide-up stagger-1">
              Your gateway to academic excellence. Access our comprehensive collection of books, 
              journals, and research materials from anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-2">
              <Link to="/search">
                <Button variant="hero" size="xl">
                  <Search className="w-5 h-5" />
                  Browse Books
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="hero-outline" size="xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Our Library?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide a modern, efficient library management system designed for the academic community.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 bg-card rounded-xl border border-border card-hover animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Join our library community today. Students and faculty can register for an account 
            and start exploring our collection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="default" size="lg">
                Register Now
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-5 h-5" />
            <span className="font-serif font-bold">IT Department Library</span>
          </div>
          <p className="text-primary-foreground/70 text-sm">
            © {new Date().getFullYear()} IT Library Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </PublicLayout>
  );
};

export default Index;
