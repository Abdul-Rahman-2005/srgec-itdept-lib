import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, User, Phone, Calendar, GraduationCap } from 'lucide-react';

const RegistrationManagement = () => {
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingUsers((data as Profile[]) || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch pending registrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleAction = async (userId: string, action: 'active' | 'rejected', userName: string, phone: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: action })
        .eq('id', userId);

      if (error) throw error;

      // Send SMS notification
      try {
        await supabase.functions.invoke('send-sms', {
          body: {
            to: phone,
            message: action === 'active' 
              ? `Hello ${userName}! Your library account has been approved. You can now login and start borrowing books.`
              : `Hello ${userName}. Your library registration request has been rejected. Please contact the library for more information.`,
          },
        });
      } catch (smsError) {
        console.error('SMS notification failed:', smsError);
      }

      toast({
        title: 'Success',
        description: `Registration ${action === 'active' ? 'approved' : 'rejected'} successfully`,
      });

      fetchPendingUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update registration status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout allowedRoles={['librarian']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Registration Management</h1>
          <p className="text-muted-foreground mt-1">Approve or reject pending user registrations</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : pendingUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="font-serif text-xl font-semibold mb-2">No Pending Registrations</h2>
              <p className="text-muted-foreground">All registration requests have been processed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((user) => (
              <Card key={user.id} className="border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <Badge variant="outline" className="capitalize">
                            {user.role === 'student' ? (
                              <GraduationCap className="w-3 h-3 mr-1" />
                            ) : (
                              <User className="w-3 h-3 mr-1" />
                            )}
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <GraduationCap className="w-4 h-4" />
                          <span>{user.roll_or_faculty_id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleAction(user.id, 'rejected', user.name, user.phone)}
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Reject
                      </Button>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleAction(user.id, 'active', user.name, user.phone)}
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RegistrationManagement;
