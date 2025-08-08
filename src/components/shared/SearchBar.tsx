import React, { useState } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchBarProps {
  onSearch?: (searchParams: SearchParams) => void;
  className?: string;
  size?: 'default' | 'large';
}

interface SearchParams {
  location: string;
  propertyType: string;
  priceRange: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  className = "",
  size = "default" 
}) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: '',
    propertyType: '',
    priceRange: ''
  });

  const handleSearch = () => {
    onSearch?.(searchParams);
  };

  const containerClass = size === 'large' 
    ? "bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20"
    : "bg-white rounded-lg p-4 shadow-lg border border-border";

  const inputClass = size === 'large' 
    ? "h-12 text-base"
    : "h-10";

  const buttonClass = size === 'large'
    ? "h-12 px-8 text-base font-semibold"
    : "h-10";

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location Input */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Enter location..."
            value={searchParams.location}
            onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
            className={`pl-10 border-border ${inputClass}`}
          />
        </div>

        {/* Property Type Select */}
        <Select 
          value={searchParams.propertyType} 
          onValueChange={(value) => setSearchParams(prev => ({ ...prev, propertyType: value }))}
        >
          <SelectTrigger className={`border-border ${inputClass}`}>
            <SelectValue placeholder="Property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="land">Land</SelectItem>
          </SelectContent>
        </Select>

        {/* Price Range Select */}
        <Select 
          value={searchParams.priceRange} 
          onValueChange={(value) => setSearchParams(prev => ({ ...prev, priceRange: value }))}
        >
          <SelectTrigger className={`border-border ${inputClass}`}>
            <SelectValue placeholder="Price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-500000">Up to 500K ETB</SelectItem>
            <SelectItem value="500000-1000000">500K - 1M ETB</SelectItem>
            <SelectItem value="1000000-2000000">1M - 2M ETB</SelectItem>
            <SelectItem value="2000000-5000000">2M - 5M ETB</SelectItem>
            <SelectItem value="5000000+">5M+ ETB</SelectItem>
          </SelectContent>
        </Select>

        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          className={buttonClass}
          variant={size === 'large' ? 'hero' : 'default'}
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {size === 'large' && (
        <div className="mt-4 flex items-center justify-center">
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      )}
    </div>
  );
};