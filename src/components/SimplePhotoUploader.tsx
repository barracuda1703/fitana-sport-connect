import React, { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SimplePhotoUploaderProps {
  currentPhoto?: string;
  onPhotoUploaded: (url: string) => void;
  userId: string;
}

export const SimplePhotoUploader: React.FC<SimplePhotoUploaderProps> = ({
  currentPhoto,
  onPhotoUploaded,
  userId
}) => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !validateFile(file)) return;

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profiles table with new avatar URL
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatarurl: publicUrl })
        .eq('id', userId);
      
      if (profileError) {
        console.error('Error updating profile with avatar:', profileError);
        toast({
          title: "Ostrzeżenie",
          description: "Zdjęcie przesłane, ale nie zapisano w profilu",
          variant: "destructive"
        });
      }

      onPhotoUploaded(publicUrl);
      
      toast({
        title: "Zdjęcie zostało przesłane",
        description: "Twoje zdjęcie profilowe zostało zaktualizowane.",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Błąd przesyłania",
        description: error.message || "Nie udało się przesłać zdjęcia. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const removePhoto = () => {
    onPhotoUploaded('');
    toast({
      title: "Zdjęcie usunięte",
      description: "Zdjęcie profilowe zostało usunięte.",
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {currentPhoto ? (
        <div className="relative">
          <img
            src={currentPhoto}
            alt="Zdjęcie profilowe"
            className="w-32 h-32 object-cover rounded-full border-4 border-primary/20"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={removePhoto}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/50 rounded-full flex items-center justify-center">
          <Camera className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      
      <div className="text-center">
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Przesyłanie...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {currentPhoto ? 'Zmień zdjęcie' : 'Dodaj zdjęcie'}
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          JPG, PNG (max 5MB)
        </p>
      </div>
    </div>
  );
};
