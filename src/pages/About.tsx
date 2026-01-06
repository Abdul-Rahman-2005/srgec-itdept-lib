import { PublicLayout } from '@/components/layouts/PublicLayout';
import { BookOpen, Users, Target, Mail, Phone, MapPin } from 'lucide-react';

const About = () => {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="py-16 bg-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 animate-slide-up">
            About Our Library
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto animate-slide-up stagger-1">
            Empowering students and faculty with knowledge resources since establishment.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-card rounded-xl border border-border card-hover">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To provide comprehensive library services that support the educational, research, 
                and informational needs of our academic community. We strive to maintain a 
                well-organized collection of resources and create an environment conducive to 
                learning and intellectual growth.
              </p>
            </div>
            <div className="p-8 bg-card rounded-xl border border-border card-hover">
              <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-accent" />
              </div>
              <h2 className="font-serif text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become a leading academic library that embraces innovation, fosters a 
                culture of reading, and serves as the intellectual hub of the IT department. 
                We aim to continuously evolve with technological advancements while preserving 
                the essence of traditional library services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Book Lending',
                description: 'Borrow books for up to 6 months with SMS reminders for due dates.',
              },
              {
                title: 'Digital Catalog',
                description: 'Search our entire collection online and check availability instantly.',
              },
              {
                title: 'Reference Support',
                description: 'Get assistance from our librarian for research and reference queries.',
              },
              {
                title: 'Reading Space',
                description: 'Comfortable reading areas for individual and group study sessions.',
              },
              {
                title: 'New Arrivals',
                description: 'Stay updated with the latest additions to our collection.',
              },
              {
                title: 'Reservation System',
                description: 'Reserve books in advance and get notified when available.',
              },
            ].map((service, index) => (
              <div
                key={service.title}
                className="p-6 bg-card rounded-xl border border-border"
              >
                <h3 className="font-serif text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">Contact Us</h2>
          <div className="max-w-xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Address</h3>
                  <p className="text-muted-foreground">
                    IT Department Library, Main Block, Room No:M-329
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Phone</h3>
                  <p className="text-muted-foreground">+91 72889 57515</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Email</h3>
                  <p className="text-muted-foreground">library@itdept.edu</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Librarian</h3>
                  <p className="text-muted-foreground">Ms. Deepika -Librarian-IT Dept</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default About;
