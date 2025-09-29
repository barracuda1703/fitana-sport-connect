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
    <div className="fixed top-2 left-2 z-50">
      <Button 
        variant="destructive" 
        size="sm"
        onClick={handleRoleSwitch}
        className="text-xs px-2 py-1 h-6 text-white bg-red-500 hover:bg-red-600"
      >
        {user.role === 'client' ? '→T' : '→K'}
      </Button>
    </div>
  );
};