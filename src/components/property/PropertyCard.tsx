import React from 'react';
import { MapPin, Bed, Bath, Square, CheckCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  imageUrl: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  isVerified?: boolean;
  isFavorited?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onClick?: (id: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  price,
  location,
  imageUrl,
  bedrooms,
  bathrooms,
  area,
  isVerified = false,
  isFavorited = false,
  onFavoriteToggle,
  onClick
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div 
      className="property-card cursor-pointer group"
      onClick={() => onClick?.(id)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay Elements */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {isVerified && (
            <Badge className="verified-badge">
              <CheckCircle className="h-3 w-3" />
              Verified
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`ml-auto bg-white/90 hover:bg-white ${
              isFavorited ? 'text-red-500' : 'text-muted-foreground'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.(id);
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-white/95 text-primary font-semibold px-3 py-1">
            {formatPrice(price)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm location-text">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{area} m²</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          variant="outline" 
          className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(id);
          }}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};