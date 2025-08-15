-- Supabase Storage Setup for tasks-images
-- Run this in your Supabase SQL editor

-- 1. Create the storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tasks-images', 'tasks-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create policy to allow authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Users can upload their own images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'tasks-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Create policy to allow users to view their own images
CREATE POLICY IF NOT EXISTS "Users can view their own images" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'tasks-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Create policy to allow users to update their own images
CREATE POLICY IF NOT EXISTS "Users can update their own images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'tasks-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Create policy to allow users to delete their own images
CREATE POLICY IF NOT EXISTS "Users can delete their own images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'tasks-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Verify the bucket exists
SELECT * FROM storage.buckets WHERE id = 'tasks-images';