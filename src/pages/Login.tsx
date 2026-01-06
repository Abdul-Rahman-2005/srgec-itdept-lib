import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen, GraduationCap, UserCog, User } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  identifier: z.string().min(1, 'This field is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginRole = 'student' | 'faculty' | 'librarian';

const Login = () => {
  const [role, setRole] = useState<LoginRole>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const getPlaceholder = () => {
    switch (role) {
      case 'student':
        return 'Enter your Roll Number (e.g., 23481A12K9)';
      case 'faculty':
        return 'Enter your Faculty ID (e.g., it_00001)';
      case 'librarian':
        return 'Enter your Username';
    }
  };

  const getLabel = () => {
    switch (role) {
      case 'student':
        return 'Roll Number';
      case 'faculty':
        return 'Faculty ID';
      case 'librarian':
        return 'Username';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = loginSchema.safeParse({ identifier, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      let email: string;
      let profileToUse: any = null;

      // For librarian, use specific email
      if (role === 'librarian') {
        if (identifier !== 'ITDEPTLIB@123') {
          toast({
            title: 'Invalid Username',
            description: 'Librarian username is incorrect.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        email = 'librarian@itlibrary.local';
      } else {
        // For students and faculty, use the SECURITY DEFINER function to bypass RLS
        const { data: profiles, error: profileError } = await supabase
          .rpc('get_profile_for_login', {
            p_identifier: identifier.toUpperCase(),
            p_role: role
          });

        if (profileError) throw profileError;

        if (!profiles || profiles.length === 0) {
          toast({
            title: 'Account Not Found',
            description: `No ${role} account found with this ${getLabel().toLowerCase()}.`,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        profileToUse = profiles[0];

        // Check account status
        if (profileToUse.status === 'pending') {
          navigate('/account-status', { state: { status: 'pending' } });
          return;
        }

        if (profileToUse.status === 'rejected') {
          navigate('/account-status', { state: { status: 'rejected' } });
          return;
        }

        email = `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@library.local`;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        toast({
          title: 'Login Failed',
          description: 'Invalid credentials. Please check your password.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Fetch profile after successful login for librarian
      if (role === 'librarian') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: librarianProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          profileToUse = librarianProfile;
        }
      }

      toast({
        title: 'Welcome Back!',
        description: `Logged in successfully as ${profileToUse?.name || 'Librarian'}`,
      });

      // Navigate to appropriate dashboard
      switch (role) {
        case 'librarian':
          navigate('/librarian');
          break;
        case 'faculty':
          navigate('/faculty');
          break;
        case 'student':
          navigate('/student');
          break;
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'student' as LoginRole, label: 'Student', icon: GraduationCap },
    { value: 'faculty' as LoginRole, label: 'Faculty', icon: User },
    { value: 'librarian' as LoginRole, label: 'Librarian', icon: UserCog },
  ];

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-secondary">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border animate-scale-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground mt-1">Sign in to your account</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setRole(option.value);
                    setIdentifier('');
                  }}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1 ${role === option.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50'
                    }`}
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">{getLabel()}</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder={getPlaceholder()}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={errors.identifier ? 'border-destructive' : ''}
                />
                {errors.identifier && (
                  <p className="text-sm text-destructive">{errors.identifier}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            {/* Footer */}
            {role !== 'librarian' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary font-medium hover:underline">
                    Register here
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Login;
