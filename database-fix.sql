-- Fix the database schema to allow NULL values for image columns
-- Run this in your Supabase SQL editor

-- Make image_url and image_path columns nullable
ALTER TABLE tasks ALTER COLUMN image_url DROP NOT NULL;
ALTER TABLE tasks ALTER COLUMN image_path DROP NOT NULL;

-- Verify the change
\d tasks;