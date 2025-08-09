import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '@/services/api';

interface ApiStatusProps {
  className?: string;
}

export const ApiStatus: React.FC<ApiStatusProps> = ({ className }) => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setStatus('checking');
        // Simple health check - try to get properties without auth
        await api.get('/properties?limit=1');
        setStatus('online');
      } catch (error) {
        setStatus('offline');
      } finally {
        setLastChecked(new Date());
      }
    };

    checkApiStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Clock className="h-3 w-3" />;
      case 'online':
        return <CheckCircle className="h-3 w-3" />;
      case 'offline':
        return <XCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'secondary';
      case 'online':
        return 'default';
      case 'offline':
        return 'destructive';
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Backend API</span>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor()} className="flex items-center gap-1">
              {getStatusIcon()}
              {status}
            </Badge>
          </div>
        </div>
        {lastChecked && (
          <p className="text-xs text-muted-foreground mt-1">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}
        </p>
      </CardContent>
    </Card>
  );
};