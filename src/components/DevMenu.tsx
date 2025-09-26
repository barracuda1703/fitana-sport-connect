import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dataStore } from '@/services/DataStore';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw, Database, UserCheck, MessageSquare, Calendar } from 'lucide-react';

export const DevMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, switchRole } = useAuth();
  
  // Only show in development
  if (import.meta.env.PROD) return null;

  const handleResetData = () => {
    dataStore.resetData();
    window.location.reload();
  };

  const handleSeedData = () => {
    dataStore.seedData();
    window.location.reload();
  };

  const handleSwitchRole = () => {
    if (user) {
      switchRole(user.role === 'client' ? 'trainer' : 'client');
    }
  };

  const handleSimulateMessage = async () => {
    if (user) {
      const chatId = `chat-${user.id}-t-1`;
      await dataStore.sendMessage({
        chatId,
        senderId: 't-1',
        content: `Cześć! To jest symulowana wiadomość o ${new Date().toLocaleTimeString()}`
      });
    }
  };

  const handleSimulateBooking = async () => {
    if (user && user.role === 'trainer') {
      await dataStore.createBooking({
        clientId: 'u-client1',
        trainerId: user.id,
        serviceId: 'srv-1',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        notes: 'Symulowana rezerwacja'
      });
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 h-8 w-8 p-0 bg-red-500 hover:bg-red-600"
        size="sm"
      >
        🔧
      </Button>
    );
  }

  return (
    <Card className="fixed top-4 right-4 z-50 w-80 shadow-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          🔧 Dev Menu
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            ✕
          </Button>
        </CardTitle>
        {user && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{user.name}</Badge>
            <Badge variant={user.role === 'client' ? 'default' : 'secondary'}>
              {user.role}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          onClick={handleResetData}
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Reset Demo Data
        </Button>
        
        <Button
          onClick={handleSeedData}
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          <Database className="h-3 w-3 mr-2" />
          Seed Data
        </Button>
        
        {user && (
          <Button
            onClick={handleSwitchRole}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <UserCheck className="h-3 w-3 mr-2" />
            Switch Role
          </Button>
        )}
        
        {user && (
          <Button
            onClick={handleSimulateMessage}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <MessageSquare className="h-3 w-3 mr-2" />
            Simulate New Message
          </Button>
        )}
        
        {user && user.role === 'trainer' && (
          <Button
            onClick={handleSimulateBooking}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Calendar className="h-3 w-3 mr-2" />
            Simulate Booking Request
          </Button>
        )}
        
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Demo credentials:<br/>
          client@test.com / demo123<br/>
          anna@test.com / demo123
        </div>
      </CardContent>
    </Card>
  );
};