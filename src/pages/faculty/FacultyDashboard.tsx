import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, BookMarked } from 'lucide-react';

const FacultyDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ borrowed: 0, returned: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile) return;
      try {
        const { data: borrows } = await supabase.from('borrows').select('*').eq('user_id', profile.id);
        const now = new Date();
        const borrowed = borrows?.filter(b => b.status === 'borrowed') || [];
        setStats({
          borrowed: borrowed.length,
          returned: borrows?.filter(b => b.status === 'returned').length || 0,
          overdue: borrowed.filter(b => new Date(b.due_date) < now).length,
        });
      } finally { setLoading(false); }
    };
    fetchStats();
  }, [profile]);

  return (
    <DashboardLayout allowedRoles={['faculty']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">Welcome, {profile?.name}</h1>
          <p className="text-muted-foreground mt-1">Faculty ID: {profile?.roll_or_faculty_id}</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title: 'Books Borrowed', value: stats.borrowed, icon: BookMarked, color: 'text-primary', bg: 'bg-primary/10' },
            { title: 'Books Returned', value: stats.returned, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { title: 'Overdue', value: stats.overdue, icon: Clock, color: 'text-destructive', bg: 'bg-destructive/10' },
          ].map(s => (
            <Card key={s.title}><CardContent className="p-6 flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">{s.title}</p><p className="text-3xl font-bold mt-1">{loading ? '-' : s.value}</p></div>
              <div className={`p-3 rounded-xl ${s.bg}`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
            </CardContent></Card>
          ))}
        </div>
        <Card><CardHeader><CardTitle className="font-serif">Quick Actions</CardTitle></CardHeader>
          <CardContent><div className="grid sm:grid-cols-2 gap-4">
            <a href="/faculty/search" className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
              <BookOpen className="w-6 h-6 text-primary mb-2" /><p className="font-medium">Search Books</p>
            </a>
            <a href="/faculty/borrowed" className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
              <BookMarked className="w-6 h-6 text-primary mb-2" /><p className="font-medium">My Borrowed Books</p>
            </a>
          </div></CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
export default FacultyDashboard;
