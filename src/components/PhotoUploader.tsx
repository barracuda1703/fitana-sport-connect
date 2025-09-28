import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploaderProps {
  profilePhoto?: string;
  gallery?: string[];
  onProfilePhotoChange: (photo: string | null) => void;
  onGalleryChange: (photos: string[]) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  profilePhoto,
  gallery = [],
  onProfilePhotoChange,
  onGalleryChange
}) => {
  const { toast } = useToast();
  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Nieprawidłowy format",
        description: "Dozwolone formaty: JPG, JPEG, PNG",
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
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create object URL for preview (in real app would upload to server)
      const photoUrl = URL.createObjectURL(file);
      onProfilePhotoChange(photoUrl);
      
      toast({
        title: "Zdjęcie profilowe zaktualizowane",
        description: "Twoje zdjęcie profilowe zostało pomyślnie zmienione.",
      });
    } catch (error) {
      toast({
        title: "Błąd przesyłania",
        description: "Nie udało się przesłać zdjęcia. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setUploadingProfile(false);
      if (profileInputRef.current) {
        profileInputRef.current.value = '';
      }
    }
  };

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check if total photos would exceed 6
    if (gallery.length + files.length > 6) {
      toast({
        title: "Za dużo zdjęć",
        description: "Możesz mieć maksymalnie 6 zdjęć w galerii.",
        variant: "destructive"
      });
      return;
    }

    // Validate all files
    for (const file of files) {
      if (!validateFile(file)) return;
    }

    setUploadingGallery(true);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create object URLs for preview (in real app would upload to server)
      const photoUrls = files.map(file => URL.createObjectURL(file));
      onGalleryChange([...gallery, ...photoUrls]);
      
      toast({
        title: "Zdjęcia dodane",
        description: `Dodano ${files.length} ${files.length === 1 ? 'zdjęcie' : 'zdjęć'} do galerii.`,
      });
    } catch (error) {
      toast({
        title: "Błąd przesyłania",
        description: "Nie udało się przesłać zdjęć. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
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

  const removeGalleryPhoto = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    onGalleryChange(newGallery);
    toast({
      title: "Zdjęcie usunięte",
      description: "Zdjęcie zostało usunięte z galerii.",
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
          
          <div>
            <input
              ref={profileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
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
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Galeria zdjęć ({gallery.length}/6)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {gallery.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {gallery.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Zdjęcie ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => removeGalleryPhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {/* Add more photos slot */}
              {gallery.length < 6 && (
                <div
                  className="aspect-square border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-muted-foreground/50 rounded-lg">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Brak zdjęć w galerii</p>
              <Button
                variant="outline"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
              >
                <Upload className="h-4 w-4 mr-2" />
                Dodaj pierwsze zdjęcie
              </Button>
            </div>
          )}
          
          <input
            ref={galleryInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            multiple
            onChange={handleGalleryUpload}
            className="hidden"
          />
          
          {gallery.length > 0 && gallery.length < 6 && (
            <Button
              variant="outline"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingGallery}
              className="w-full"
            >
              {uploadingGallery ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Przesyłanie...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Dodaj więcej zdjęć
                </>
              )}
            </Button>
          )}
          
          <div className="text-xs text-muted-foreground">
            <p>• Dozwolone formaty: JPG, JPEG, PNG</p>
            <p>• Maksymalny rozmiar: 5MB na zdjęcie</p>
            <p>• Maksymalna liczba zdjęć: 6</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};