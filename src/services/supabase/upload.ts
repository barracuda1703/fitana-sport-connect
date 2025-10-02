import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload avatar to Supabase Storage
 * @param userId - User ID for folder organization
 * @param file - File to upload
 * @param role - User role (trainer or client)
 * @returns Public URL of uploaded file
 */
export const uploadAvatar = async (
  userId: string,
  file: File,
  role: 'trainer' | 'client'
): Promise<UploadResult> => {
  // Validate file
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Nieprawidłowy typ pliku. Dozwolone: JPG, PNG, WEBP');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Plik jest za duży. Maksymalny rozmiar: 5MB');
  }

  // Create unique filename
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload to storage
  const { error: uploadError, data } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Błąd uploadu: ${uploadError.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update profile with avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatarurl: publicUrl })
    .eq('id', userId);

  if (updateError) {
    throw new Error(`Błąd aktualizacji profilu: ${updateError.message}`);
  }

  return { url: publicUrl, path: filePath };
};

/**
 * Upload gallery photo for trainer
 * @param trainerId - Trainer user ID
 * @param file - File to upload
 * @returns Public URL of uploaded file
 */
export const uploadGalleryPhoto = async (
  trainerId: string,
  file: File
): Promise<UploadResult> => {
  // Validate file
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Nieprawidłowy typ pliku. Dozwolone: JPG, PNG, WEBP');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Plik jest za duży. Maksymalny rozmiar: 5MB');
  }

  // Create unique filename
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${trainerId}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `trainer-gallery/${fileName}`;

  // Upload to storage (we'll use avatars bucket for now since trainer-gallery might not exist)
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Błąd uploadu: ${uploadError.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return { url: publicUrl, path: filePath };
};

/**
 * Upload chat image to Supabase Storage
 * @param userId - User ID for folder organization
 * @param chatId - Chat ID for folder organization
 * @param file - File to upload
 * @returns Public URL of uploaded file
 */
export const uploadChatImage = async (
  userId: string,
  chatId: string,
  file: File
): Promise<UploadResult> => {
  // Validate file
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Nieprawidłowy typ pliku. Dozwolone: JPG, PNG, GIF, WEBP');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Plik jest za duży. Maksymalny rozmiar: 5MB');
  }

  // Create unique filename
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${userId}/${chatId}/${fileName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('chat-attachments')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Błąd uploadu: ${uploadError.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('chat-attachments')
    .getPublicUrl(filePath);

  return { url: publicUrl, path: filePath };
};

/**
 * Delete file from storage
 * @param filePath - Path to file in storage
 * @param bucket - Storage bucket name
 */
export const deleteFile = async (
  filePath: string,
  bucket: string = 'avatars'
): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throw new Error(`Błąd usuwania pliku: ${error.message}`);
  }
};
