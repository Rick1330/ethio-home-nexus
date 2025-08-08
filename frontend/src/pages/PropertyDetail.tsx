import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  CheckCircle, 
  Heart, 
  Star,
  Calendar,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Mock property data
const mockProperty = {
  id: '1',
  title: 'Modern Villa in Bole',
  price: 2500000,
  location: 'Bole, Addis Ababa',
  description: 'This stunning modern villa offers luxurious living in the heart of Bole. Featuring contemporary design, high-end finishes, and spacious rooms throughout. Perfect for families looking for comfort and style.',
  images: [
    '/src/assets/property-1.jpg',
    '/src/assets/property-2.jpg',
    '/src/assets/property-3.jpg',
  ],
  bedrooms: 4,
  bathrooms: 3,
  area: 250,
  yearBuilt: 2020,
  propertyType: 'Villa',
  parkingSpaces: 2,
  isVerified: true,
  isFavorited: false,
  features: [
    'Swimming Pool',
    'Garden',
    'Security System',
    'Modern Kitchen',
    'Air Conditioning',
    'Balcony',
    'Garage',
    'Fireplace'
  ],
  agent: {
    name: 'Sarah Mekonnen',
    phone: '+251-911-123456',
    email: 'sarah@ethiohome.com',
    image: '/src/assets/property-1.jpg',
    rating: 4.8,
    listings: 24
  },
  reviews: [
    {
      id: '1',
      user: 'John Doe',
      rating: 5,
      comment: 'Amazing property with great location and beautiful design.',
      date: '2024-01-15'
    },
    {
      id: '2',
      user: 'Mary Smith',
      rating: 4,
      comment: 'Very nice villa, but could use better parking.',
      date: '2024-01-10'
    }
  ]
};

const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const property = mockProperty; // In real app, fetch by id

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleSubmitInterest = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Interest form submitted:', formData);
    setShowContactForm(false);
    // Show success message
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Navigation */}
              {property.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {property.images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>

              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="icon"
                className={`absolute top-4 right-4 bg-white/90 hover:bg-white ${
                  isFavorited ? 'text-red-500' : 'text-muted-foreground'
                }`}
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Property Details */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{property.title}</h1>
                  {property.isVerified && (
                    <Badge className="verified-badge">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{property.location}</span>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(property.price)}
                </div>
              </div>

              {/* Property Stats */}
              <div className="flex items-center gap-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{property.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{property.area} m²</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Property Features */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Features & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                    >
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Property Information</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Property Type</span>
                    <p className="font-medium">{property.propertyType}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Year Built</span>
                    <p className="font-medium">{property.yearBuilt}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Parking</span>
                    <p className="font-medium">{property.parkingSpaces} spaces</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{property.agent.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">
                        {property.agent.rating} ({property.agent.listings} listings)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full"
                    onClick={() => setShowContactForm(true)}
                  >
                    Express Interest
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form Modal */}
            {showContactForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Express Interest</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitInterest} className="space-y-4">
                    <Input
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      name="phone"
                      placeholder="Your Phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                    <Textarea
                      name="message"
                      placeholder="Message (optional)"
                      value={formData.message}
                      onChange={handleInputChange}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Submit
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowContactForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Similar Properties */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                      <img
                        src="/src/assets/property-2.jpg"
                        alt="Similar property"
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">Apartment in Kazanchis</h4>
                        <p className="text-xs text-muted-foreground">2 bed • 2 bath</p>
                        <p className="text-sm font-semibold text-primary">ETB 800,000</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyDetail;