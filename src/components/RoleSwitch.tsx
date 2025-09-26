import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export const RoleSwitch: React.FC = () => {
  const { user, switchRole } = useAuth();

  // Don't render if no user or in loading state
  if (!user) return null;

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-card p-2 rounded-lg shadow-lg border">
      <Badge variant={user.role === 'client' ? 'default' : 'secondary'}>
        {user.role === 'client' ? 'Klient' : 'Trener'}
      </Badge>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => switchRole(user.role === 'client' ? 'trainer' : 'client')}
      >
        Przełącz na {user.role === 'client' ? 'Trenera' : 'Klienta'}
      </Button>
    </div>
  );
};