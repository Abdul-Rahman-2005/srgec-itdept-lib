-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('student', 'faculty', 'librarian');

-- Create enum for user status
CREATE TYPE public.user_status AS ENUM ('pending', 'active', 'rejected');

-- Create enum for borrow status
CREATE TYPE public.borrow_status AS ENUM ('borrowed', 'returned');

-- Create profiles table for user information
CREATE TABLE public.profiles (
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
CREATE TABLE public.books (
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
CREATE TABLE public.borrows (
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

-- Create triggers for book copy management
CREATE TRIGGER on_borrow_decrease_copies
AFTER INSERT ON public.borrows
FOR EACH ROW EXECUTE FUNCTION public.decrease_book_copies();

CREATE TRIGGER on_return_increase_copies
AFTER UPDATE ON public.borrows
FOR EACH ROW EXECUTE FUNCTION public.increase_book_copies();