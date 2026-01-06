import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Book, Borrow, Profile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Clock, CheckCircle } from 'lucide-react';

const LibrarianDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    pendingRegistrations: 0,
    activeBorrows: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, profilesRes, borrowsRes] = await Promise.all([
          supabase.from('books').select('id', { count: 'exact' }),
          supabase.from('profiles').select('id, status', { count: 'exact' }),
          supabase.from('borrows').select('id, status', { count: 'exact' }),
        ]);

        const profiles = profilesRes.data || [];
        const borrows = borrowsRes.data || [];

        setStats({
          totalBooks: booksRes.count || 0,
          pendingRegistrations: profiles.filter(p => p.status === 'pending').length,
          activeBorrows: borrows.filter(b => b.status === 'borrowed').length,
          totalUsers: profiles.filter(p => p.status === 'active').length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending Registrations',
      value: stats.pendingRegistrations,
      icon: Clock,
      color: 'text-amber',
      bgColor: 'bg-amber/10',
    },
    {
      title: 'Active Borrows',
      value: stats.activeBorrows,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Active Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <DashboardLayout allowedRoles={['librarian']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Librarian Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage books, users, and borrowing records</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{loading ? '-' : stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-serif">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a href="/librarian/registrations" className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                <Users className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium">Review Registrations</p>
                <p className="text-sm text-muted-foreground">Approve or reject user accounts</p>
              </a>
              <a href="/librarian/add-book" className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                <BookOpen className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium">Add New Book</p>
                <p className="text-sm text-muted-foreground">Add books to the collection</p>
              </a>
              <a href="/librarian/record-borrow" className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                <CheckCircle className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium">Record Borrow</p>
                <p className="text-sm text-muted-foreground">Issue or return books</p>
              </a>
              <a href="/librarian/borrows" className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                <Clock className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium">View Borrows</p>
                <p className="text-sm text-muted-foreground">Track all borrowed books</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LibrarianDashboard;
