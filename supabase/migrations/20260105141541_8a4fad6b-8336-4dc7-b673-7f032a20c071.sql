-- Add book_code column to borrows table
ALTER TABLE public.borrows 
ADD COLUMN book_code text;

-- Create a unique constraint to prevent same book_code being borrowed twice while not returned
-- This is a partial unique index that only applies to borrowed (not returned) books
CREATE UNIQUE INDEX idx_borrows_book_code_active 
ON public.borrows (book_code) 
WHERE status = 'borrowed' AND book_code IS NOT NULL;