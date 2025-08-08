import React, { useState } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Home, 
  Heart, 
  MessageSquare, 
  Settings, 
  TrendingUp,
  Eye,
  Calendar,
  MapPin,
  Plus
} from 'lucide-react';

// Mock user data
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'buyer',
  avatar: '',
  joinDate: '2024-01-15',
  stats: {
    viewedProperties: 24,
    savedProperties: 8,
    interestSubmitted: 3,
    activeListings: 0
  }
};

// Mock data for recent activities
const mockActivities = [
  {
    id: '1',
    type: 'view',
    title: 'Viewed Modern Villa in Bole',
    date: '2024-01-20',
    property: {
      title: 'Modern Villa in Bole',
      price: 2500000,
      location: 'Bole, Addis Ababa'
    }
  },
  {
    id: '2',
    type: 'favorite',
    title: 'Saved Apartment in Kazanchis',
    date: '2024-01-19',
    property: {
      title: 'Cozy Apartment in Kazanchis',
      price: 800000,
      location: 'Kazanchis, Addis Ababa'
    }
  },
  {
    id: '3',
    type: 'interest',
    title: 'Expressed interest in Luxury Penthouse',
    date: '2024-01-18',
    property: {
      title: 'Luxury Penthouse in CMC',
      price: 4200000,
      location: 'CMC, Addis Ababa'
    }
  }
];

// Mock saved properties
const mockSavedProperties = [
  {
    id: '1',
    title: 'Modern Villa in Bole',
    price: 2500000,
    location: 'Bole, Addis Ababa',
    imageUrl: '/src/assets/property-1.jpg',
    savedDate: '2024-01-20'
  },
  {
    id: '2',
    title: 'Cozy Apartment in Kazanchis',
    price: 800000,
    location: 'Kazanchis, Addis Ababa',
    imageUrl: '/src/assets/property-2.jpg',
    savedDate: '2024-01-19'
  }
];

const Dashboard = () => {
  const [user] = useState(mockUser);
  const [activeTab, setActiveTab] = useState('overview');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'saved', label: 'Saved Properties', icon: Heart },
    { id: 'interests', label: 'My Interests', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (user.role === 'seller') {
    sidebarItems.splice(2, 0, { id: 'listings', label: 'My Listings', icon: Home });
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your property search.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties Viewed</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.viewedProperties}</div>
            <p className="text-xs text-muted-foreground">+3 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Properties</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.savedProperties}</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Submitted</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.interestSubmitted}</div>
            <p className="text-xs text-muted-foreground">+1 from last week</p>
          </CardContent>
        </Card>

        {user.role === 'seller' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.stats.activeListings}</div>
              <p className="text-xs text-muted-foreground">No change</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest interactions with properties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <h4 className="font-medium">{activity.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{activity.date}</span>
                    <MapPin className="h-3 w-3" />
                    <span>{activity.property.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    {formatPrice(activity.property.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSavedProperties = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Saved Properties</h1>
          <p className="text-muted-foreground">Properties you've bookmarked for later</p>
        </div>
        <Badge variant="secondary">{mockSavedProperties.length} properties</Badge>
      </div>

      {mockSavedProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockSavedProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="aspect-video">
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(property.price)}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4 fill-current text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved properties yet</h3>
            <p className="text-muted-foreground mb-4">
              Start exploring properties and save your favorites here
            </p>
            <Button onClick={() => window.location.href = '/properties'}>
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'saved':
        return renderSavedProperties();
      case 'interests':
        return (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Interest Forms</h3>
              <p className="text-muted-foreground">Your submitted interest forms will appear here</p>
            </CardContent>
          </Card>
        );
      case 'listings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
                <p className="text-muted-foreground">Manage your property listings</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Property
              </Button>
            </div>
            <Card className="text-center py-12">
              <CardContent>
                <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first property listing
                </p>
                <Button>Add Property</Button>
              </CardContent>
            </Card>
          </div>
        );
      case 'profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {user.role === 'buyer' ? 'Property Buyer' : 'Property Seller'}
                  </Badge>
                </div>
              </div>
              <Button variant="outline">Edit Profile</Button>
            </CardContent>
          </Card>
        );
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings panel coming soon...</p>
            </CardContent>
          </Card>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-2 p-4">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;