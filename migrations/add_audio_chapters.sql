-- Migration to add audioChapters column to projects table
-- Run this when database is available

ALTER TABLE projects ADD COLUMN audio_chapters JSON;

-- Update existing projects to have empty chapters array
UPDATE projects SET audio_chapters = '[]' WHERE audio_chapters IS NULL;
