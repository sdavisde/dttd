-- Ensure the primary files bucket exists in every environment.
-- This bucket backs admin file management and public meeting minute access.

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('files', 'files', true, 52428800)
ON CONFLICT (id) DO NOTHING;
