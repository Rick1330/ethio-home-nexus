import React, { useState } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, SlidersHorizontal } from 'lucide-react';

// Mock data for properties
const mockProperties = [
  {
    id: '1',
    title: 'Modern Villa in Bole',
    price: 2500000,
    location: 'Bole, Addis Ababa',
    imageUrl: '/src/assets/property-1.jpg',
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    isVerified: true,
    isFavorited: false,
  },
  {
    id: '2',
    title: 'Cozy Apartment in Kazanchis',
    price: 800000,
    location: 'Kazanchis, Addis Ababa',
    imageUrl: '/src/assets/property-2.jpg',
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    isVerified: false,
    isFavorited: true,
  },
  {
    id: '3',
    title: 'Luxury Penthouse in CMC',
    price: 4200000,
    location: 'CMC, Addis Ababa',
    imageUrl: '/src/assets/property-3.jpg',
    bedrooms: 5,
    bathrooms: 4,
    area: 350,
    isVerified: true,
    isFavorited: false,
  },
  // Add more mock properties
  {
    id: '4',
    title: 'Family House in Gerji',
    price: 1800000,
    location: 'Gerji, Addis Ababa',
    imageUrl: '/src/assets/property-1.jpg',
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    isVerified: true,
    isFavorited: false,
  },
  {
    id: '5',
    title: 'Studio Apartment in Piazza',
    price: 450000,
    location: 'Piazza, Addis Ababa',
    imageUrl: '/src/assets/property-2.jpg',
    bedrooms: 1,
    bathrooms: 1,
    area: 60,
    isVerified: false,
    isFavorited: false,
  },
  {
    id: '6',
    title: 'Commercial Building in Merkato',
    price: 8500000,
    location: 'Merkato, Addis Ababa',
    imageUrl: '/src/assets/property-3.jpg',
    bedrooms: 0,
    bathrooms: 6,
    area: 800,
    isVerified: true,
    isFavorited: true,
  },
];

const Properties = () => {
  const [properties, setProperties] = useState(mockProperties);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['2', '6']));
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price-low');
  const [showFilters, setShowFilters] = useState(false);

  const handleFavoriteToggle = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);

    // Update the properties with the new favorite status
    setProperties(prevProperties =>
      prevProperties.map(property =>
        property.id === id
          ? { ...property, isFavorited: newFavorites.has(id) }
          : property
      )
    );
  };

  const handlePropertyClick = (id: string) => {
    // Navigate to property details page
    window.location.href = `/properties/${id}`;
  };

  const filteredProperties = properties
    .filter(property =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'area-large':
          return b.area - a.area;
        case 'area-small':
          return a.area - b.area;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Properties for Sale</h1>
          <p className="text-muted-foreground">
            Discover your perfect home from our extensive collection of verified properties
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by location, title, or features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort By */}
            <div className="w-full lg:w-64">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="area-large">Area: Large to Small</SelectItem>
                  <SelectItem value="area-small">Area: Small to Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full lg:w-auto"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <Input placeholder="Min" type="number" />
                    <Input placeholder="Max" type="number" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bedrooms</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Property Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="bole">Bole</SelectItem>
                      <SelectItem value="kazanchis">Kazanchis</SelectItem>
                      <SelectItem value="cmc">CMC</SelectItem>
                      <SelectItem value="gerji">Gerji</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-foreground font-medium">
              {filteredProperties.length} properties found
            </span>
            {searchTerm && (
              <Badge variant="secondary">
                <MapPin className="h-3 w-3 mr-1" />
                {searchTerm}
              </Badge>
            )}
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={handlePropertyClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">
              No properties found matching your criteria
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setShowFilters(false);
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredProperties.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Properties
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Properties;