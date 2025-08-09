import React, { useState } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Hero } from '@/components/shared/Hero';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Footer } from '@/components/shared/Footer';
import { ApiStatus } from '@/components/shared/ApiStatus';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Star, TrendingUp } from 'lucide-react';
import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';
import property3 from '@/assets/property-3.jpg';

const Index = () => {
  // Mock data for featured properties
  const featuredProperties = [
    {
      id: '1',
      title: 'Modern Villa in Bole',
      price: 2500000,
      location: 'Bole, Addis Ababa',
      imageUrl: property1,
      bedrooms: 4,
      bathrooms: 3,
      area: 250,
      isVerified: true,
    },
    {
      id: '2',
      title: 'Luxury Apartment in CMC',
      price: 1800000,
      location: 'CMC, Addis Ababa',
      imageUrl: property2,
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      isVerified: true,
    },
    {
      id: '3',
      title: 'Traditional House in Merkato',
      price: 950000,
      location: 'Merkato, Addis Ababa',
      imageUrl: property3,
      bedrooms: 3,
      bathrooms: 2,
      area: 200,
      isVerified: false,
    },
  ];

  const [favorites, setFavorites] = useState<string[]>([]);

  const handleFavoriteToggle = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSearch = (searchParams: any) => {
    console.log('Search params:', searchParams);
    // Implement search functionality
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <Hero onSearch={handleSearch} />

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Ethio-Home?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We make finding your dream home simple, secure, and stress-free
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Properties</h3>
              <p className="text-muted-foreground">
                Every property is thoroughly verified to ensure authenticity and quality
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Trusted Sellers</h3>
              <p className="text-muted-foreground">
                Connect with verified real estate agents and property owners
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Market Insights</h3>
              <p className="text-muted-foreground">
                Get real-time market data and pricing insights for informed decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Featured Properties
              </h2>
              <p className="text-xl text-muted-foreground">
                Discover our hand-picked selection of premium properties
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex">
              View All Properties
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map(property => (
              <PropertyCard
                key={property.id}
                {...property}
                isFavorited={favorites.includes(property.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={(id) => console.log('Property clicked:', id)}
              />
            ))}
          </div>

          <div className="text-center mt-12 md:hidden">
            <Button variant="outline">
              View All Properties
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect property through Ethio-Home
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg">
              Start Searching
            </Button>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white hover:text-primary">
              List Your Property
            </Button>
          </div>
        </div>
      </section>

      {/* API Status for development */}
      <section className="py-8 bg-muted/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ApiStatus />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
