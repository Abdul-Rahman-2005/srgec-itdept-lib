-- Create magazines table
CREATE TABLE public.magazines (
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

-- Trigger for updated_at
CREATE TRIGGER update_magazines_updated_at
BEFORE UPDATE ON public.magazines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create journals table
CREATE TABLE public.journals (
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

-- Trigger for updated_at
CREATE TRIGGER update_journals_updated_at
BEFORE UPDATE ON public.journals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create csp_project_files table
CREATE TABLE public.csp_project_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_year TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for csp_project_files
ALTER TABLE public.csp_project_files ENABLE ROW LEVEL SECURITY;

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

-- Create storage bucket for CSP files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('csp-files', 'csp-files', true);

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