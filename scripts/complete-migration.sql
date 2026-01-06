-- ============================================
-- Complete Database Migration Script
-- IT Department Library Management System
-- Run this in Supabase SQL Editor
-- ============================================

-- Migration 1: Core Schema
-- ============================================

-- Create enum for user roles (if not exists)
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('student', 'faculty', 'librarian');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for user status (if not exists)
DO $$ BEGIN
    CREATE TYPE public.user_status AS ENUM ('pending', 'active', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for borrow status (if not exists)
DO $$ BEGIN
    CREATE TYPE public.borrow_status AS ENUM ('borrowed', 'returned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  roll_or_faculty_id TEXT UNIQUE,
  phone TEXT NOT NULL,
  status user_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create books table
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT NOT NULL,
  edition TEXT NOT NULL,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create borrows table
CREATE TABLE IF NOT EXISTS public.borrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '6 months'),
  returned_at TIMESTAMP WITH TIME ZONE,
  status borrow_status NOT NULL DEFAULT 'borrowed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrows ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is librarian
CREATE OR REPLACE FUNCTION public.is_librarian(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = 'librarian' AND status = 'active'
  )
$$;

-- Create function to check if user is active
CREATE OR REPLACE FUNCTION public.is_active_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND status = 'active'
  )
$$;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Librarian can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view books" ON public.books;
DROP POLICY IF EXISTS "Librarian can insert books" ON public.books;
DROP POLICY IF EXISTS "Librarian can update books" ON public.books;
DROP POLICY IF EXISTS "Librarian can delete books" ON public.books;
DROP POLICY IF EXISTS "Users can view their own borrows" ON public.borrows;
DROP POLICY IF EXISTS "Librarian can insert borrows" ON public.borrows;
DROP POLICY IF EXISTS "Librarian can update borrows" ON public.borrows;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_librarian(auth.uid()));

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Librarian can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_librarian(auth.uid()));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Books RLS policies (public read, librarian write)
CREATE POLICY "Anyone can view books"
ON public.books FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Librarian can insert books"
ON public.books FOR INSERT
TO authenticated
WITH CHECK (public.is_librarian(auth.uid()));

CREATE POLICY "Librarian can update books"
ON public.books FOR UPDATE
TO authenticated
USING (public.is_librarian(auth.uid()));

CREATE POLICY "Librarian can delete books"
ON public.books FOR DELETE
TO authenticated
USING (public.is_librarian(auth.uid()));

-- Borrows RLS policies
CREATE POLICY "Users can view their own borrows"
ON public.borrows FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_librarian(auth.uid()));

CREATE POLICY "Librarian can insert borrows"
ON public.borrows FOR INSERT
TO authenticated
WITH CHECK (public.is_librarian(auth.uid()));

CREATE POLICY "Librarian can update borrows"
ON public.borrows FOR UPDATE
TO authenticated
USING (public.is_librarian(auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_books_updated_at ON public.books;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to decrease available copies on borrow
CREATE OR REPLACE FUNCTION public.decrease_book_copies()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.books 
  SET available_copies = available_copies - 1 
  WHERE id = NEW.book_id AND available_copies > 0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to increase available copies on return
CREATE OR REPLACE FUNCTION public.increase_book_copies()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'returned' AND OLD.status = 'borrowed' THEN
    UPDATE public.books 
    SET available_copies = available_copies + 1 
    WHERE id = NEW.book_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_borrow_decrease_copies ON public.borrows;
DROP TRIGGER IF EXISTS on_return_increase_copies ON public.borrows;

-- Create triggers for book copy management
CREATE TRIGGER on_borrow_decrease_copies
AFTER INSERT ON public.borrows
FOR EACH ROW EXECUTE FUNCTION public.decrease_book_copies();

CREATE TRIGGER on_return_increase_copies
AFTER UPDATE ON public.borrows
FOR EACH ROW EXECUTE FUNCTION public.increase_book_copies();

-- Migration 2: Login Function
-- ============================================

-- Create a function to lookup profile for login (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_profile_for_login(
  p_identifier text,
  p_role text
)
RETURNS TABLE (
  id uuid,
  name text,
  status user_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, status
  FROM profiles
  WHERE roll_or_faculty_id = p_identifier
    AND role = p_role::user_role
  LIMIT 1;
$$;

-- Migration 3: Additional Resources
-- ============================================

-- Create magazines table
CREATE TABLE IF NOT EXISTS public.magazines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  issue_number TEXT NOT NULL,
  publication_date DATE NOT NULL,
  category TEXT NOT NULL,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for magazines
ALTER TABLE public.magazines ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view magazines" ON public.magazines;
DROP POLICY IF EXISTS "Librarian can insert magazines" ON public.magazines;
DROP POLICY IF EXISTS "Librarian can update magazines" ON public.magazines;
DROP POLICY IF EXISTS "Librarian can delete magazines" ON public.magazines;

-- Magazines policies
CREATE POLICY "Anyone can view magazines"
ON public.magazines FOR SELECT
USING (true);

CREATE POLICY "Librarian can insert magazines"
ON public.magazines FOR INSERT
WITH CHECK (is_librarian(auth.uid()));

CREATE POLICY "Librarian can update magazines"
ON public.magazines FOR UPDATE
USING (is_librarian(auth.uid()));

CREATE POLICY "Librarian can delete magazines"
ON public.magazines FOR DELETE
USING (is_librarian(auth.uid()));

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_magazines_updated_at ON public.magazines;

-- Trigger for updated_at
CREATE TRIGGER update_magazines_updated_at
BEFORE UPDATE ON public.magazines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create journals table
CREATE TABLE IF NOT EXISTS public.journals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  issn TEXT NOT NULL,
  volume TEXT NOT NULL,
  issue TEXT NOT NULL,
  publication_year INTEGER NOT NULL,
  category TEXT NOT NULL,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for journals
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view journals" ON public.journals;
DROP POLICY IF EXISTS "Librarian can insert journals" ON public.journals;
DROP POLICY IF EXISTS "Librarian can update journals" ON public.journals;
DROP POLICY IF EXISTS "Librarian can delete journals" ON public.journals;

-- Journals policies
CREATE POLICY "Anyone can view journals"
ON public.journals FOR SELECT
USING (true);

CREATE POLICY "Librarian can insert journals"
ON public.journals FOR INSERT
WITH CHECK (is_librarian(auth.uid()));

CREATE POLICY "Librarian can update journals"
ON public.journals FOR UPDATE
USING (is_librarian(auth.uid()));

CREATE POLICY "Librarian can delete journals"
ON public.journals FOR DELETE
USING (is_librarian(auth.uid()));

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_journals_updated_at ON public.journals;

-- Trigger for updated_at
CREATE TRIGGER update_journals_updated_at
BEFORE UPDATE ON public.journals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create csp_project_files table
CREATE TABLE IF NOT EXISTS public.csp_project_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_year TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for csp_project_files
ALTER TABLE public.csp_project_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view csp_project_files" ON public.csp_project_files;
DROP POLICY IF EXISTS "Librarian can insert csp_project_files" ON public.csp_project_files;
DROP POLICY IF EXISTS "Librarian can update csp_project_files" ON public.csp_project_files;
DROP POLICY IF EXISTS "Librarian can delete csp_project_files" ON public.csp_project_files;

-- CSP files policies
CREATE POLICY "Anyone can view csp_project_files"
ON public.csp_project_files FOR SELECT
USING (true);

CREATE POLICY "Librarian can insert csp_project_files"
ON public.csp_project_files FOR INSERT
WITH CHECK (is_librarian(auth.uid()));

CREATE POLICY "Librarian can update csp_project_files"
ON public.csp_project_files FOR UPDATE
USING (is_librarian(auth.uid()));

CREATE POLICY "Librarian can delete csp_project_files"
ON public.csp_project_files FOR DELETE
USING (is_librarian(auth.uid()));

-- Create storage bucket for CSP files (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('csp-files', 'csp-files', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view csp files" ON storage.objects;
DROP POLICY IF EXISTS "Librarian can upload csp files" ON storage.objects;
DROP POLICY IF EXISTS "Librarian can update csp files" ON storage.objects;
DROP POLICY IF EXISTS "Librarian can delete csp files" ON storage.objects;

-- Storage policies for CSP files bucket
CREATE POLICY "Anyone can view csp files"
ON storage.objects FOR SELECT
USING (bucket_id = 'csp-files');

CREATE POLICY "Librarian can upload csp files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'csp-files' AND is_librarian(auth.uid()));

CREATE POLICY "Librarian can update csp files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'csp-files' AND is_librarian(auth.uid()));

CREATE POLICY "Librarian can delete csp files"
ON storage.objects FOR DELETE
USING (bucket_id = 'csp-files' AND is_librarian(auth.uid()));

-- Migration 4: Book Code Enhancement
-- ============================================

-- Add book_code column to borrows table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'borrows' 
        AND column_name = 'book_code'
    ) THEN
        ALTER TABLE public.borrows ADD COLUMN book_code text;
    END IF;
END $$;

-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_borrows_book_code_active;

-- Create a unique constraint to prevent same book_code being borrowed twice while not returned
-- This is a partial unique index that only applies to borrowed (not returned) books
CREATE UNIQUE INDEX idx_borrows_book_code_active 
ON public.borrows (book_code) 
WHERE status = 'borrowed' AND book_code IS NOT NULL;

-- ============================================
-- Migration Complete!
-- ============================================




