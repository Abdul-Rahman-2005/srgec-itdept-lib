import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Edit2, Trash2, BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const ManageBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchBooks = async (query?: string) => {
    setLoading(true);
    try {
      let queryBuilder = supabase.from('books').select('*');
      
      if (query && query.trim()) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,author.ilike.%${query}%,publisher.ilike.%${query}%`
        );
      }
      
      const { data, error } = await queryBuilder.order('title');
      
      if (error) throw error;
      setBooks((data as Book[]) || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch books',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(searchQuery);
  };

  const handleUpdate = async () => {
    if (!editBook) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('books')
        .update({
          title: editBook.title,
          author: editBook.author,
          publisher: editBook.publisher,
          edition: editBook.edition,
          total_copies: editBook.total_copies,
          available_copies: editBook.available_copies,
          cover_url: editBook.cover_url,
        })
        .eq('id', editBook.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Book updated successfully',
      });

      setEditBook(null);
      fetchBooks(searchQuery);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update book',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteBook) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', deleteBook.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Book deleted successfully',
      });

      setDeleteBook(null);
      fetchBooks(searchQuery);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete book',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['librarian']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Manage Books</h1>
          <p className="text-muted-foreground mt-1">View, edit, or delete books from the collection</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
          <Input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {/* Books List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : books.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="font-serif text-xl font-semibold mb-2">No Books Found</h2>
              <p className="text-muted-foreground">Add some books to the collection.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {books.map((book) => (
              <Card key={book.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-28 rounded bg-secondary flex-shrink-0 overflow-hidden">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-lg truncate">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">by {book.author}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        <span className="bg-secondary px-2 py-1 rounded">{book.publisher}</span>
                        <span className="bg-secondary px-2 py-1 rounded">{book.edition}</span>
                        <span className="bg-secondary px-2 py-1 rounded">
                          {book.available_copies}/{book.total_copies} available
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditBook(book)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setDeleteBook(book)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editBook} onOpenChange={() => setEditBook(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Book</DialogTitle>
            </DialogHeader>
            {editBook && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editBook.title}
                    onChange={(e) => setEditBook({ ...editBook, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input
                    value={editBook.author}
                    onChange={(e) => setEditBook({ ...editBook, author: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Publisher</Label>
                  <Input
                    value={editBook.publisher}
                    onChange={(e) => setEditBook({ ...editBook, publisher: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Edition</Label>
                  <Input
                    value={editBook.edition}
                    onChange={(e) => setEditBook({ ...editBook, edition: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Copies</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editBook.total_copies}
                      onChange={(e) => setEditBook({ ...editBook, total_copies: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Available Copies</Label>
                    <Input
                      type="number"
                      min="0"
                      max={editBook.total_copies}
                      value={editBook.available_copies}
                      onChange={(e) => setEditBook({ ...editBook, available_copies: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cover URL (optional)</Label>
                  <Input
                    value={editBook.cover_url || ''}
                    onChange={(e) => setEditBook({ ...editBook, cover_url: e.target.value })}
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditBook(null)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={actionLoading}>
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteBook} onOpenChange={() => setDeleteBook(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Book</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete "{deleteBook?.title}"? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteBook(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ManageBooks;
