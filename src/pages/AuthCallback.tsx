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
        // Check for pending role from OAuth flow via URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const pendingRole = urlParams.get('role');
        
        // Update role if specified in URL or if user has no role assigned
        if (pendingRole && (pendingRole !== user.role || !user.role)) {
          console.log('Updating user role from OAuth:', { pendingRole, currentRole: user.role });
          
          const { error } = await supabase
            .from('profiles')
            .update({ 
              role: pendingRole,
              pending_role: null // Clear pending_role after successful assignment
            })
            .eq('id', user.id);
          
          if (!error) {
            console.log('Role updated successfully, refreshing...');
            // Refresh user data
            window.location.reload();
            return;
          } else {
            console.error('Failed to update role:', error);
          }
        }
        
        if (user.role === 'client') {
          navigate('/client', { replace: true });
        } else if (user.role === 'trainer') {
          try {
            const trainerProfile = await trainersService.getByUserId(user.id);
            
            // Check if trainer profile exists and has ALL required data
            const hasCompletedProfile = trainerProfile && 
              trainerProfile.specialties && 
              trainerProfile.specialties.length > 0 &&
              trainerProfile.bio &&
              trainerProfile.bio.trim().length > 0 &&
              trainerProfile.locations &&
              Array.isArray(trainerProfile.locations) &&
              trainerProfile.locations.length > 0 &&
              trainerProfile.availability &&
              Array.isArray(trainerProfile.availability) &&
              trainerProfile.availability.length > 0 &&
              user.avatarUrl; // Photo is required
            
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
