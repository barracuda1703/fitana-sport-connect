-- Extend messages table with new columns
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS deleted_for_users UUID[] DEFAULT ARRAY[]::UUID[];

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_id_created_at ON public.messages(chat_id, created_at);

-- Add RLS policies for chat-attachments bucket
CREATE POLICY "Users can upload to their chats"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.chats
    WHERE (client_id = auth.uid() OR trainer_id = auth.uid())
    AND id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Users can view chat attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-attachments'
  AND EXISTS (
    SELECT 1 FROM public.chats
    WHERE (client_id = auth.uid() OR trainer_id = auth.uid())
    AND id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Users can delete their attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add comment for documentation
COMMENT ON COLUMN public.messages.deleted_for_users IS 'Array of user IDs who have deleted this message (soft delete)';
COMMENT ON COLUMN public.messages.reactions IS 'Array of reaction objects: [{"user_id": "uuid", "emoji": "❤️"}]';