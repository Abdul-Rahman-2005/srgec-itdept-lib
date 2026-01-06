import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, BookMarked } from 'lucide-react';

const StudentDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    borrowed: 0,
    returned: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile) return;

      try {
        const { data: borrows, error } = await supabase
          .from('borrows')
          .select('*')
          .eq('user_id', profile.id);

        if (error) throw error;

        const now = new Date();
        const borrowed = borrows?.filter(b => b.status === 'borrowed') || [];
        const returned = borrows?.filter(b => b.status === 'returned') || [];
        const overdue = borrowed.filter(b => new Date(b.due_date) < now);

        setStats({
          borrowed: borrowed.length,
          returned: returned.length,
          overdue: overdue.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile]);

  const statCards = [
    {
      title: 'Books Borrowed',
      value: stats.borrowed,
      icon: BookMarked,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Books Returned',
      value: stats.returned,
      icon: BookOpen,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: Clock,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <DashboardLayout allowedRoles={['student']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Welcome, {profile?.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Student ID: {profile?.roll_or_faculty_id}
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
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
            <div className="grid sm:grid-cols-2 gap-4">
              <a href="/student/search" className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                <BookOpen className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium">Search Books</p>
                <p className="text-sm text-muted-foreground">Find and explore available books</p>
              </a>
              <a href="/student/borrowed" className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                <BookMarked className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium">My Borrowed Books</p>
                <p className="text-sm text-muted-foreground">View your borrowed books</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
