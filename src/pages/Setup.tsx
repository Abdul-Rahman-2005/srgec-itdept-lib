import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, CheckCircle } from 'lucide-react';

const Setup = () => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadySetup, setAlreadySetup] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkIfLibrarianExists();
  }, []);

  const checkIfLibrarianExists = async () => {
    try {
      // Try to sign in with librarian credentials to check if account exists
      const { error } = await supabase.auth.signInWithPassword({
        email: 'librarian@itlibrary.local',
        password: 'ITLibrarian@123',
      });

      if (!error) {
        // Librarian exists, sign out and mark as setup
        await supabase.auth.signOut();
        setAlreadySetup(true);
      }
    } catch {
      // Ignore errors, librarian doesn't exist
    } finally {
      setChecking(false);
    }
  };

  const handleSetup = async () => {
    setLoading(true);

    try {
      // Sign up the librarian account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: 'librarian@itlibrary.local',
        password: 'ITLibrarian@123',
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setAlreadySetup(true);
          toast({
            title: 'Already Setup',
            description: 'Librarian account already exists.',
          });
          return;
        }
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Create the librarian profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: 'ITLIBRARIAN',
          phone: '0000000000',
          role: 'librarian',
          roll_or_faculty_id: 'ITDEPTLIB@123',
          status: 'active',
        });

      if (profileError) {
        throw profileError;
      }

      // Sign out after setup
      await supabase.auth.signOut();

      toast({
        title: 'Setup Complete!',
        description: 'Librarian account created. You can now login.',
      });

      setAlreadySetup(true);
    } catch (error: any) {
      toast({
        title: 'Setup Failed',
        description: error.message || 'An error occurred during setup.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <PublicLayout>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-secondary">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-secondary">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border animate-scale-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground">
                {alreadySetup ? 'Setup Complete' : 'Initial Setup'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {alreadySetup
                  ? 'The librarian account has been created'
                  : 'Create the librarian account to get started'}
              </p>
            </div>

            {alreadySetup ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center text-green-600">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Librarian Credentials:</p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Username:</strong> ITDEPTLIB@123
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Password:</strong> ITLibrarian@123
                  </p>
                </div>
                <Button onClick={() => navigate('/login')} className="w-full" size="lg">
                  Go to Login
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This will create the default librarian account with the following credentials:
                  </p>
                  <ul className="mt-2 text-sm">
                    <li><strong>Username:</strong> ITDEPTLIB@123</li>
                    <li><strong>Password:</strong> ITLibrarian@123</li>
                  </ul>
                </div>
                <Button onClick={handleSetup} className="w-full" size="lg" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Librarian Account
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Setup;
