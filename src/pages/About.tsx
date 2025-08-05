import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  CheckCircle, 
  Award, 
  Target,
  Heart,
  Shield,
  TrendingUp
} from 'lucide-react';

const About = () => {
  const stats = [
    { label: 'Properties Listed', value: '10,000+', icon: Home },
    { label: 'Happy Customers', value: '5,000+', icon: Users },
    { label: 'Verified Listings', value: '95%', icon: CheckCircle },
    { label: 'Years of Experience', value: '8+', icon: Award },
  ];

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To revolutionize Ethiopia\'s real estate market by connecting property seekers with their dream homes through technology and trust.'
    },
    {
      icon: Heart,
      title: 'Our Values',
      description: 'Transparency, integrity, and customer satisfaction are at the core of everything we do. We believe in honest transactions and building lasting relationships.'
    },
    {
      icon: Shield,
      title: 'Our Promise',
      description: 'Every property listing is verified by our team to ensure authenticity and quality, giving you peace of mind in your property search.'
    }
  ];

  const team = [
    {
      name: 'Abebe Kebede',
      role: 'CEO & Founder',
      image: '/src/assets/property-1.jpg',
      description: 'Real estate veteran with 15+ years of experience in Ethiopian property market.'
    },
    {
      name: 'Hanan Mohammed',
      role: 'Head of Operations',
      image: '/src/assets/property-2.jpg',
      description: 'Expert in property verification and customer experience optimization.'
    },
    {
      name: 'Daniel Tesfaye',
      role: 'Technology Director',
      image: '/src/assets/property-3.jpg',
      description: 'Tech innovator focused on creating seamless digital property experiences.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-hero-gradient rounded-2xl flex items-center justify-center">
              <Home className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Ethio-Home
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ethiopia's most trusted real estate platform, connecting thousands of property seekers 
            with their perfect homes since 2016. We're transforming how Ethiopians buy, sell, and 
            discover properties.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center p-6">
                <CardContent className="space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Story Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2016, Ethio-Home emerged from a simple yet powerful vision: to make 
                  property transactions in Ethiopia transparent, efficient, and accessible to everyone.
                </p>
                <p>
                  Starting with just 50 property listings in Addis Ababa, we've grown to become 
                  Ethiopia's largest real estate platform, featuring thousands of verified properties 
                  across major cities and regions.
                </p>
                <p>
                  Our journey has been marked by continuous innovation, from introducing the first 
                  property verification system in Ethiopia to launching advanced search filters 
                  that help users find exactly what they're looking for.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                <img
                  src="/src/assets/hero-home.jpg"
                  alt="Our story"
                  className="w-full h-full object-cover mix-blend-overlay"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-hero-gradient rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What Drives Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our commitment to excellence and innovation guides everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center p-8">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-hero-gradient rounded-2xl flex items-center justify-center mx-auto">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Leadership</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The passionate team behind Ethiopia's real estate revolution
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-hero-gradient text-white text-center p-12">
          <CardContent className="space-y-6">
            <h2 className="text-3xl font-bold">Ready to Find Your Dream Home?</h2>
            <p className="text-white/90 max-w-2xl mx-auto text-lg">
              Join thousands of satisfied customers who have found their perfect properties through Ethio-Home
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => window.location.href = '/properties'}
              >
                Browse Properties
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
                onClick={() => window.location.href = '/signup'}
              >
                Join Ethio-Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default About;