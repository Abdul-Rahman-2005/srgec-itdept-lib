import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen, User, Calendar, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface BorrowRecord {
  id: string;
  user_id: string;
  book_id: string;
  book_code: string | null;
  borrow_date: string;
  due_date: string;
  returned_at: string | null;
  status: 'borrowed' | 'returned';
  book: {
    title: string;
    author: string;
  };
  profile: {
    name: string;
    roll_or_faculty_id: string;
    role: string;
  };
}

const BorrowRecords = () => {
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnBorrow, setReturnBorrow] = useState<BorrowRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchBorrows = async () => {
    try {
      const { data, error } = await supabase
        .from('borrows')
        .select(`
          *,
          book:books(title, author),
          profile:profiles(name, roll_or_faculty_id, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBorrows((data as BorrowRecord[]) || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch borrow records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  const handleReturn = async () => {
    if (!returnBorrow) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('borrows')
        .update({ 
          status: 'returned',
          returned_at: new Date().toISOString(),
        })
        .eq('id', returnBorrow.id);

      if (error) throw error;

      // Send SMS notification
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', returnBorrow.user_id)
          .single();

        if (profile?.phone) {
          await supabase.functions.invoke('send-sms', {
            body: {
              to: profile.phone,
              message: `Your book "${returnBorrow.book.title}" has been successfully returned. Thank you for using the library!`,
            },
          });
        }
      } catch (smsError) {
        console.error('SMS notification failed:', smsError);
      }

      toast({
        title: 'Success',
        description: 'Book return recorded successfully',
      });

      setReturnBorrow(null);
      fetchBorrows();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record return',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <DashboardLayout allowedRoles={['librarian']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Borrow Records</h1>
          <p className="text-muted-foreground mt-1">View and manage all borrowing transactions</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : borrows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="font-serif text-xl font-semibold mb-2">No Borrow Records</h2>
              <p className="text-muted-foreground">No books have been borrowed yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {borrows.map((borrow) => (
              <Card key={borrow.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif font-semibold text-lg">{borrow.book.title}</h3>
                        {borrow.book_code && (
                          <Badge variant="outline" className="font-mono">
                            {borrow.book_code}
                          </Badge>
                        )}
                        <Badge variant={borrow.status === 'borrowed' ? 'default' : 'secondary'}>
                          {borrow.status === 'borrowed' ? 'Borrowed' : 'Returned'}
                        </Badge>
                        {borrow.status === 'borrowed' && isOverdue(borrow.due_date) && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">by {borrow.book.author}</p>
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>{borrow.profile.name} ({borrow.profile.roll_or_faculty_id})</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Borrowed: {new Date(borrow.borrow_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span className={isOverdue(borrow.due_date) && borrow.status === 'borrowed' ? 'text-destructive' : ''}>
                            Due: {new Date(borrow.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {borrow.status === 'borrowed' && (
                      <Button
                        variant="outline"
                        onClick={() => setReturnBorrow(borrow)}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Record Return
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Return Confirmation Dialog */}
        <Dialog open={!!returnBorrow} onOpenChange={() => setReturnBorrow(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Book Return</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Confirm that "{returnBorrow?.book.title}" has been returned by {returnBorrow?.profile.name}?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReturnBorrow(null)}>Cancel</Button>
              <Button onClick={handleReturn} disabled={actionLoading}>
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Return
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default BorrowRecords;
