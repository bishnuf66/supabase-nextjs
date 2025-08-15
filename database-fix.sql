-- Fix the database schema for image columns
-- Run this in your Supabase SQL editor

-- Update any existing NULL values to empty strings
UPDATE tasks SET image_url = '' WHERE image_url IS NULL;
UPDATE tasks SET image_path = '' WHERE image_path IS NULL;

-- Set default values for the columns
ALTER TABLE tasks ALTER COLUMN image_url SET DEFAULT '';
ALTER TABLE tasks ALTER COLUMN image_path SET DEFAULT '';

-- Ensure columns are NOT NULL with empty string defaults
ALTER TABLE tasks ALTER COLUMN image_url SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN image_path SET NOT NULL;

-- Verify the change
\d tasks;