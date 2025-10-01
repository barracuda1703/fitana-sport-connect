import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { trainersService } from '@/services/supabase/trainers';
import { supabase } from '@/integrations/supabase/client';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkTrainerProfile = async () => {
      if (!isLoading && user) {
        // Check for pending role from OAuth flow
        const pendingRole = localStorage.getItem('pending_role');
        if (pendingRole && pendingRole !== user.role) {
          // Update the user's role if it was set during OAuth
          const { error } = await supabase
            .from('profiles')
            .update({ role: pendingRole })
            .eq('id', user.id);
          
          if (!error) {
            localStorage.removeItem('pending_role');
            // Refresh user data
            window.location.reload();
            return;
          }
        }
        
        if (user.role === 'client') {
          navigate('/client', { replace: true });
        } else if (user.role === 'trainer') {
          try {
            const trainerProfile = await trainersService.getByUserId(user.id);
            
            // Check if trainer profile exists and has required data
            const hasCompletedProfile = trainerProfile && 
              trainerProfile.specialties && 
              trainerProfile.specialties.length > 0;
            
            if (!hasCompletedProfile) {
              navigate('/profile/setup', { replace: true });
            } else {
              navigate('/trainer', { replace: true });
            }
          } catch (error) {
            // If no trainer profile exists, redirect to setup
            navigate('/profile/setup', { replace: true });
          }
        }
        setChecking(false);
      }
    };

    checkTrainerProfile();
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Trwa logowanie...</p>
      </div>
    </div>
  );
};
