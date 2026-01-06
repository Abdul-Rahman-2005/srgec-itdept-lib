import { useState, useEffect } from 'react';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { BookCard } from '@/components/BookCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types';
import { Search, Loader2, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SearchBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
    } catch (error: any) {
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

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="py-12 bg-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 animate-slide-up">
              Search Our Collection
            </h1>
            <p className="text-primary-foreground/80 mb-8 animate-slide-up stagger-1">
              Find books by title, author, or publisher
            </p>
            <form onSubmit={handleSearch} className="flex gap-2 animate-slide-up stagger-2">
              <Input
                type="text"
                placeholder="Enter book title, author, or publisher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button type="submit" variant="hero">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="font-serif text-xl font-semibold mb-2">No Books Found</h2>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try a different search term' : 'No books available yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Showing {books.length} book{books.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default SearchBooks;
