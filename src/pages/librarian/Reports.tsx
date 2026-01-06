import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, BookOpen, Users, ClipboardList } from 'lucide-react';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingBorrows, setLoadingBorrows] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { toast } = useToast();

  const downloadExcel = (data: any[], fileName: string, sheetName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Auto-size columns
    const maxWidth = 50;
    const colWidths = Object.keys(data[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map((row) => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, maxWidth) };
    });
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const handleBooksReport = async () => {
    setLoadingBooks(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, publisher, edition, total_copies, available_copies')
        .order('title');

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({ title: 'No Data', description: 'No books found to export', variant: 'destructive' });
        return;
      }

      const formattedData = data.map((book) => ({
        'Book ID': book.id,
        'Title': book.title,
        'Author': book.author,
        'Publisher': book.publisher,
        'Edition': book.edition,
        'Total Copies': book.total_copies,
        'Available Copies': book.available_copies,
      }));

      downloadExcel(formattedData, 'Available_Books_Report', 'Books');
      toast({ title: 'Success', description: 'Books report downloaded successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate books report', variant: 'destructive' });
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleBorrowsReport = async () => {
    setLoadingBorrows(true);
    try {
      const { data: borrows, error: borrowsError } = await supabase
        .from('borrows')
        .select('*')
        .order('borrow_date', { ascending: false });

      if (borrowsError) throw borrowsError;

      if (!borrows || borrows.length === 0) {
        toast({ title: 'No Data', description: 'No borrow records found to export', variant: 'destructive' });
        return;
      }

      // Fetch related books and profiles
      const bookIds = [...new Set(borrows.map(b => b.book_id))];
      const userIds = [...new Set(borrows.map(b => b.user_id))];

      const { data: books } = await supabase
        .from('books')
        .select('id, title')
        .in('id', bookIds);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, role, roll_or_faculty_id')
        .in('id', userIds);

      const bookMap = new Map(books?.map(b => [b.id, b.title]) || []);
      const profileMap = new Map(profiles?.map(p => [p.id, { name: p.name, role: p.role, roll_or_faculty_id: p.roll_or_faculty_id }]) || []);

      const formattedData = borrows.map((borrow) => {
        const profile = profileMap.get(borrow.user_id);
        const dueDate = new Date(borrow.due_date);
        const today = new Date();
        const isOverdue = borrow.status === 'borrowed' && dueDate < today;

        return {
          'User Name': profile?.name || 'Unknown',
          'Roll No / Faculty ID': profile?.roll_or_faculty_id || '',
          'User Role': profile?.role || 'Unknown',
          'Book Title': bookMap.get(borrow.book_id) || 'Unknown',
          'Book Code': borrow.book_code || '',
          'Issue Date': new Date(borrow.borrow_date).toLocaleDateString(),
          'Due Date': dueDate.toLocaleDateString(),
          'Return Date': borrow.returned_at ? new Date(borrow.returned_at).toLocaleDateString() : '-',
          'Status': isOverdue ? 'Overdue' : borrow.status === 'returned' ? 'Returned' : 'Issued',
        };
      });

      downloadExcel(formattedData, 'Borrow_Records_Report', 'Borrows');
      toast({ title: 'Success', description: 'Borrow records report downloaded successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate borrow records report', variant: 'destructive' });
    } finally {
      setLoadingBorrows(false);
    }
  };

  const handleUsersReport = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, phone, status, created_at, roll_or_faculty_id')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({ title: 'No Data', description: 'No active users found to export', variant: 'destructive' });
        return;
      }

      const formattedData = data.map((user) => ({
        'User ID': user.id,
        'Name': user.name,
        'Roll No / Faculty ID': user.roll_or_faculty_id || '',
        'Role': user.role.charAt(0).toUpperCase() + user.role.slice(1),
        'Phone': user.phone,
        'Account Status': user.status.charAt(0).toUpperCase() + user.status.slice(1),
        'Registration Date': new Date(user.created_at).toLocaleDateString(),
      }));

      downloadExcel(formattedData, 'Active_Users_Report', 'Users');
      toast({ title: 'Success', description: 'Active users report downloaded successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate users report', variant: 'destructive' });
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['librarian']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and download Excel reports</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Books Report */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Available Books</CardTitle>
                  <CardDescription>Complete book inventory report</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Includes: Book ID, Title, Author, Publisher, Edition, Total Copies, Available Copies
              </p>
              <Button onClick={handleBooksReport} disabled={loadingBooks} className="w-full">
                {loadingBooks ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download Report
              </Button>
            </CardContent>
          </Card>

          {/* Borrows Report */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <ClipboardList className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Borrow Records</CardTitle>
                  <CardDescription>Complete borrowing history</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Includes: User Name, Role, Book Title, Book Code, Issue Date, Due Date, Return Date, Status
              </p>
              <Button onClick={handleBorrowsReport} disabled={loadingBorrows} className="w-full">
                {loadingBorrows ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download Report
              </Button>
            </CardContent>
          </Card>

          {/* Users Report */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Active Users</CardTitle>
                  <CardDescription>All active user accounts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Includes: User ID, Name, Role, Phone, Account Status, Registration Date
              </p>
              <Button onClick={handleUsersReport} disabled={loadingUsers} className="w-full">
                {loadingUsers ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;