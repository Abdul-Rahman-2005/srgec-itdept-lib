export type UserRole = 'student' | 'faculty' | 'librarian';
export type UserStatus = 'pending' | 'active' | 'rejected';
export type BorrowStatus = 'borrowed' | 'returned';

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  roll_or_faculty_id: string | null;
  phone: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  edition: string;
  total_copies: number;
  available_copies: number;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Borrow {
  id: string;
  user_id: string;
  book_id: string;
  borrow_date: string;
  due_date: string;
  returned_at: string | null;
  status: BorrowStatus;
  created_at: string;
}

export interface BorrowWithDetails extends Borrow {
  book?: Book;
  profile?: Profile;
}

export interface Magazine {
  id: string;
  title: string;
  publisher: string;
  issue_number: string;
  publication_date: string;
  category: string;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Journal {
  id: string;
  title: string;
  publisher: string;
  issn: string;
  volume: string;
  issue: string;
  publication_year: number;
  category: string;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CSPProjectFile {
  id: string;
  academic_year: string;
  file_name: string;
  file_path: string;
  uploaded_by: string;
  uploaded_at: string;
}
