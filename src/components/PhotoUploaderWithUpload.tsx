import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Camera } from 'lucide-react';
import { uploadAvatar } from '@/services/supabase/upload';
import { Progress } from '@/components/ui/progress';

interface PhotoUploaderProps {
  profilePhoto?: string;
  onProfilePhotoChange: (photo: string | null) => void;
  userId: string;
  role: 'trainer' | 'client';
}

export const PhotoUploaderWithUpload: React.FC<PhotoUploaderProps> = ({
  profilePhoto,
  onProfilePhotoChange,
  userId,
  role,
}) => {
  const { toast } = useToast();
  const profileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Nieprawidłowy format",
        description: "Dozwolone formaty: JPG, JPEG, PNG, WEBP",
        variant: "destructive"
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "Plik za duży",
        description: "Maksymalny rozmiar pliku to 5MB",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !validateFile(file)) return;

    setUploadingProfile(true);
    setUploadProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadAvatar(userId, file, role);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      onProfilePhotoChange(result.url);
      
      toast({
        title: "Zdjęcie profilowe zaktualizowane",
        description: "Twoje zdjęcie profilowe zostało pomyślnie zmienione.",
      });
    } catch (error: any) {
      toast({
        title: "Błąd przesyłania",
        description: error.message || "Nie udało się przesłać zdjęcia. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setUploadingProfile(false);
      setUploadProgress(0);
      if (profileInputRef.current) {
        profileInputRef.current.value = '';
      }
    }
  };

  const removeProfilePhoto = () => {
    onProfilePhotoChange(null);
    toast({
      title: "Zdjęcie usunięte",
      description: "Zdjęcie profilowe zostało usunięte.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Zdjęcie profilowe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profilePhoto ? (
            <div className="relative inline-block">
              <img
                src={profilePhoto}
                alt="Zdjęcie profilowe"
                className="w-32 h-32 object-cover rounded-full border-4 border-primary/20"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={removeProfilePhoto}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/50 rounded-full flex items-center justify-center">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          <div className="space-y-2">
            <input
              ref={profileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleProfilePhotoUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => profileInputRef.current?.click()}
              disabled={uploadingProfile}
              className="w-full sm:w-auto"
            >
              {uploadingProfile ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Przesyłanie...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {profilePhoto ? 'Zmień zdjęcie' : 'Dodaj zdjęcie profilowe'}
                </>
              )}
            </Button>
            {uploadingProfile && uploadProgress > 0 && (
              <Progress value={uploadProgress} className="w-full" />
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>• Dozwolone formaty: JPG, JPEG, PNG, WEBP</p>
            <p>• Maksymalny rozmiar: 5MB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
