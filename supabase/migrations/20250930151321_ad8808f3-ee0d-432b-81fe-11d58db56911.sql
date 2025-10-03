-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('certificates', 'certificates', true),
  ('chat-attachments', 'chat-attachments', false),
  ('trainer-videos', 'trainer-videos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS policies for certificates bucket
CREATE POLICY "Certificates are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates');

CREATE POLICY "Trainers can upload their certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'certificates' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Trainers can update their certificates"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'certificates' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Trainers can delete their certificates"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'certificates' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS policies for trainer videos bucket
CREATE POLICY "Trainer videos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trainer-videos');

CREATE POLICY "Trainers can upload their videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'trainer-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Trainers can update their videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'trainer-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Trainers can delete their videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'trainer-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS policies for chat attachments bucket (private)
CREATE POLICY "Users can view attachments in their chats"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload chat attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their chat attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chat-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );