import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Book, Profile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, BookOpen, User } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RecordBorrow = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [bookCode, setBookCode] = useState('');
  const [bookCodeError, setBookCodeError] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchBooks = async (query: string) => {
    if (!query.trim()) {
      setBooks([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .gt('available_copies', 0)
        .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setBooks((data as Book[]) || []);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'active')
        .neq('role', 'librarian')
        .or(`name.ilike.%${query}%,roll_or_faculty_id.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setUsers((data as Profile[]) || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => searchBooks(bookSearch), 300);
    return () => clearTimeout(timer);
  }, [bookSearch]);

  useEffect(() => {
    const timer = setTimeout(() => searchUsers(userSearch), 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const validateBookCode = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      setBookCodeError('Book code is required');
      return false;
    }

    // Check if the book code is already borrowed and not returned
    const { data, error } = await supabase
      .from('borrows')
      .select('id')
      .eq('book_code', code.trim())
      .eq('status', 'borrowed')
      .maybeSingle();

    if (error) {
      setBookCodeError('Error validating book code');
      return false;
    }

    if (data) {
      setBookCodeError('This book code is already issued and not yet returned');
      return false;
    }

    setBookCodeError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBook || !selectedUser) {
      toast({
        title: 'Error',
        description: 'Please select both a book and a user',
        variant: 'destructive',
      });
      return;
    }

    if (!bookCode.trim()) {
      setBookCodeError('Book code is required');
      toast({
        title: 'Error',
        description: 'Please enter a book code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // Validate book code before proceeding
    const isValidCode = await validateBookCode(bookCode);
    if (!isValidCode) {
      setLoading(false);
      toast({
        title: 'Error',
        description: bookCodeError || 'Invalid book code',
        variant: 'destructive',
      });
      return;
    }

    try {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 6);

      const { error } = await supabase.from('borrows').insert({
        book_id: selectedBook,
        user_id: selectedUser,
        book_code: bookCode.trim(),
        borrow_date: new Date().toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        status: 'borrowed',
      });

      if (error) {
        if (error.code === '23505') {
          setBookCodeError('This book code is already issued and not yet returned');
          throw new Error('This book code is already issued and not yet returned');
        }
        throw error;
      }

      // Get book and user details for SMS
      const selectedBookData = books.find(b => b.id === selectedBook);
      const selectedUserData = users.find(u => u.id === selectedUser);

      if (selectedUserData && selectedBookData) {
        // Send SMS notification
        try {
          await supabase.functions.invoke('send-sms', {
            body: {
              to: selectedUserData.phone,
              message: `You have borrowed "${selectedBookData.title}". Due date: ${dueDate.toLocaleDateString()}. Please return the book before the due date.`,
            },
          });
        } catch (smsError) {
          console.error('SMS notification failed:', smsError);
        }
      }

      toast({
        title: 'Success',
        description: 'Book borrowed successfully!',
      });

      setSelectedBook('');
      setSelectedUser('');
      setBookCode('');
      setBookCodeError('');
      setBookSearch('');
      setUserSearch('');
      setBooks([]);
      setUsers([]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record borrow',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedBookData = books.find(b => b.id === selectedBook);
  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <DashboardLayout allowedRoles={['librarian']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Record Borrow</h1>
          <p className="text-muted-foreground mt-1">Issue a book to a student or faculty member</p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Borrow Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Book Selection */}
              <div className="space-y-3">
                <Label>Select Book</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or author..."
                    value={bookSearch}
                    onChange={(e) => {
                      setBookSearch(e.target.value);
                      setSelectedBook('');
                    }}
                    className="pl-10"
                  />
                </div>
                {books.length > 0 && !selectedBook && (
                  <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                    {books.map((book) => (
                      <button
                        key={book.id}
                        type="button"
                        className="w-full p-3 text-left hover:bg-secondary transition-colors flex items-center gap-3"
                        onClick={() => {
                          setSelectedBook(book.id);
                          setBookSearch(book.title);
                        }}
                      >
                        <BookOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="font-medium">{book.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {book.author} • {book.available_copies} available
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedBookData && (
                  <div className="p-3 bg-secondary rounded-lg flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{selectedBookData.title}</p>
                      <p className="text-sm text-muted-foreground">{selectedBookData.author}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* User Selection */}
              <div className="space-y-3">
                <Label>Select User</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setSelectedUser('');
                    }}
                    className="pl-10"
                  />
                </div>
                {users.length > 0 && !selectedUser && (
                  <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        className="w-full p-3 text-left hover:bg-secondary transition-colors flex items-center gap-3"
                        onClick={() => {
                          setSelectedUser(user.id);
                          setUserSearch(user.name);
                        }}
                      >
                        <User className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {user.roll_or_faculty_id} • {user.role}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedUserData && (
                  <div className="p-3 bg-secondary rounded-lg flex items-center gap-3">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{selectedUserData.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedUserData.roll_or_faculty_id} • {selectedUserData.role}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Book Code Field */}
              {selectedBook && (
                <div className="space-y-2">
                  <Label htmlFor="bookCode">Book Code Number *</Label>
                  <Input
                    id="bookCode"
                    placeholder="Enter unique book code (e.g., B001, BK-2024-001)"
                    value={bookCode}
                    onChange={(e) => {
                      setBookCode(e.target.value);
                      setBookCodeError('');
                    }}
                    className={bookCodeError ? 'border-destructive' : ''}
                  />
                  {bookCodeError && (
                    <p className="text-sm text-destructive">{bookCodeError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter the unique code printed on the book copy being issued.
                  </p>
                </div>
              )}

              {/* Due Date Info */}
              {selectedBook && selectedUser && bookCode && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Due Date:</strong> {new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    <br />
                    <span className="text-muted-foreground">
                      The user will receive an SMS notification with borrowing details.
                    </span>
                  </p>
                </div>
              )}

              <Button type="submit" size="lg" disabled={loading || !selectedBook || !selectedUser || !bookCode.trim()}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Record Borrow
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RecordBorrow;
