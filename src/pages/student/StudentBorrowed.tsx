import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BorrowedBook {
  id: string;
  borrow_date: string;
  due_date: string;
  status: 'borrowed' | 'returned';
  returned_at: string | null;
  book: {
    title: string;
    author: string;
    publisher: string;
    cover_url: string | null;
  };
}

const StudentBorrowed = () => {
  const { profile } = useAuth();
  const [borrows, setBorrows] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBorrows = async () => {
      if (!profile) return;

      try {
        const { data, error } = await supabase
          .from('borrows')
          .select(`
            *,
            book:books(title, author, publisher, cover_url)
          `)
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBorrows((data as BorrowedBook[]) || []);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch borrowed books',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBorrows();
  }, [profile]);

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <DashboardLayout allowedRoles={['student']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">My Borrowed Books</h1>
          <p className="text-muted-foreground mt-1">Track your borrowed and returned books</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : borrows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="font-serif text-xl font-semibold mb-2">No Borrowed Books</h2>
              <p className="text-muted-foreground">You haven't borrowed any books yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {borrows.map((borrow) => {
              const overdue = borrow.status === 'borrowed' && isOverdue(borrow.due_date);
              const daysRemaining = getDaysRemaining(borrow.due_date);

              return (
                <Card key={borrow.id} className="border-border overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex gap-4">
                      <div className="w-24 h-32 bg-secondary flex-shrink-0">
                        {borrow.book.cover_url ? (
                          <img
                            src={borrow.book.cover_url}
                            alt={borrow.book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 py-4 pr-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-serif font-semibold text-lg">{borrow.book.title}</h3>
                            <p className="text-sm text-muted-foreground">{borrow.book.author}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={borrow.status === 'borrowed' ? 'default' : 'secondary'}>
                              {borrow.status === 'borrowed' ? 'Borrowed' : 'Returned'}
                            </Badge>
                            {overdue && (
                              <Badge variant="destructive">Overdue</Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Borrowed: {new Date(borrow.borrow_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className={overdue ? 'text-destructive' : 'text-muted-foreground'}>
                              Due: {new Date(borrow.due_date).toLocaleDateString()}
                              {borrow.status === 'borrowed' && !overdue && daysRemaining <= 7 && (
                                <span className="ml-1 text-amber">({daysRemaining} days left)</span>
                              )}
                            </span>
                          </div>
                        </div>
                        {borrow.status === 'returned' && borrow.returned_at && (
                          <p className="mt-2 text-sm text-emerald-600">
                            Returned on {new Date(borrow.returned_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentBorrowed;
