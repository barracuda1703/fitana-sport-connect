import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const RoleSwitch: React.FC = () => {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  // Don't render if no user or in loading state
  if (!user) return null;

  const handleRoleSwitch = () => {
    const newRole = user.role === 'client' ? 'trainer' : 'client';
    switchRole(newRole);
    
    // Redirect to appropriate dashboard
    if (newRole === 'trainer') {
      navigate('/trainer');
    } else {
      navigate('/client');
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-card p-2 rounded-lg shadow-lg border">
      <Badge variant={user.role === 'client' ? 'default' : 'secondary'}>
        {user.role === 'client' ? 'Klient' : 'Trener'}
      </Badge>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleRoleSwitch}
      >
        Przełącz na {user.role === 'client' ? 'Trenera' : 'Klienta'}
      </Button>
    </div>
  );
};