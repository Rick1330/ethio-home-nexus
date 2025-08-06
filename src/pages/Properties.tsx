import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  MapPin, 
  Home as HomeIcon,
  Bed,
  Bath,
  Maximize,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { PropertyFilters } from '@/types';

// Property type options
const propertyTypes = [
  { value: '', label: 'All Types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' }
];

// Sort options
const sortOptions = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: 'features.area', label: 'Area: Small to Large' },
  { value: '-features.area', label: 'Area: Large to Small' }
];

const Properties = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const itemsPerPage = 12;

  // Build filters object for API
  const filters: PropertyFilters = useMemo(() => {
    const filterObj: PropertyFilters = {
      page: currentPage,
      limit: itemsPerPage,
      sort: sortBy,
    };

    if (searchQuery.trim()) {
      filterObj.location = searchQuery.trim();
    }

    if (selectedType) {
      filterObj.propertyType = selectedType;
    }

    if (priceRange[0] > 0) {
      filterObj.minPrice = priceRange[0];
    }

    if (priceRange[1] < 5000000) {
      filterObj.maxPrice = priceRange[1];
    }

    if (bedrooms) {
      filterObj.bedrooms = parseInt(bedrooms);
    }

    if (bathrooms) {
      filterObj.bathrooms = parseInt(bathrooms);
    }

    if (verifiedOnly) {
      filterObj.verified = true;
    }

    return filterObj;
  }, [searchQuery, selectedType, priceRange, bedrooms, bathrooms, sortBy, currentPage, verifiedOnly]);

  // Fetch properties using the API
  const { data, isLoading, error } = useProperties(filters);

  const handlePropertyClick = (id: string) => {
    navigate(`/properties/${id}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setPriceRange([0, 5000000]);
    setBedrooms('');
    setBathrooms('');
    setVerifiedOnly(false);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedType || priceRange[0] > 0 || 
    priceRange[1] < 5000000 || bedrooms || bathrooms || verifiedOnly;

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Properties</h3>
              <p className="text-muted-foreground mb-4">
                We're having trouble loading the properties. Please try again later.
              </p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

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
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by location, title, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Toggle */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full lg:w-auto"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters {hasActiveFilters && <Badge variant="secondary" className="ml-2">Active</Badge>}
            </Button>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Advanced Filters</CardTitle>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Property Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Bedrooms</label>
                    <Select value={bedrooms} onValueChange={setBedrooms}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Bathrooms</label>
                    <Select value={bathrooms} onValueChange={setBathrooms}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Verified Only */}
                  <div className="flex items-center space-x-2">
                    <input
                      id="verified"
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="rounded border border-border"
                    />
                    <label htmlFor="verified" className="text-sm font-medium">
                      Verified properties only
                    </label>
                  </div>
                </div>

                {/* Price Range */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">
                    Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={5000000}
                    min={0}
                    step={50000}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              'Loading properties...'
            ) : data ? (
              `Showing ${data.data.properties.length} of ${data.pagination.total} properties`
            ) : (
              'No properties found'
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading properties...</span>
          </div>
        )}

        {/* Properties Grid */}
        {!isLoading && data && data.data.properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {data.data.properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                price={property.price}
                location={`${property.location.address}, ${property.location.city}`}
                imageUrl={property.images[0] || '/src/assets/property-1.jpg'}
                bedrooms={property.features.bedrooms}
                bathrooms={property.features.bathrooms}
                area={property.features.area}
                isVerified={property.isVerified}
                isFavorited={false} // TODO: Implement favorites
                onFavoriteToggle={() => {}} // TODO: Implement favorites
                onClick={() => handlePropertyClick(property.id)}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && data && data.data.properties.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <HomeIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters to find more properties.
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters}>Clear Filters</Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!isLoading && data && data.pagination.pages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
              const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (pageNum <= data.pagination.pages) {
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              }
              return null;
            })}
            
            <Button
              variant="outline"
              disabled={currentPage === data.pagination.pages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Properties;