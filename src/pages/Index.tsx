import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { trainersService } from '@/services/supabase/trainers';

const Index: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isLoading && user) {
        if (user.role === 'client') {
          setRedirectPath('/client');
        } else if (user.role === 'trainer') {
          try {
            const trainerProfile = await trainersService.getByUserId(user.id);
            
            // Check if trainer profile exists and has required data
            const hasCompletedProfile = trainerProfile && 
              trainerProfile.specialties && 
              trainerProfile.specialties.length > 0;
            
            if (!hasCompletedProfile) {
              setRedirectPath('/profile/setup');
            } else {
              setRedirectPath('/trainer');
            }
          } catch (error) {
            // If no trainer profile exists, redirect to setup
            setRedirectPath('/profile/setup');
          }
        }
        setChecking(false);
      }
    };

    checkUserStatus();
  }, [user, isLoading]);

  if (isLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return null;
};

export { Index };
