import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen, GraduationCap, User } from 'lucide-react';
import { z } from 'zod';

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  rollNumber: z
    .string()
    .regex(/^(23|24|25)\d{2}(1A|5A)\d{2}[A-Z0-9]{2}$/i, 'Invalid roll number format (e.g., 23481A12K9)'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number (10 digits starting with 6-9)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const facultySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  facultyId: z.string().regex(/^it_\d{5}$/i, 'Invalid faculty ID format (e.g., it_00001)'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number (10 digits starting with 6-9)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterRole = 'student' | 'faculty';

const Register = () => {
  const [role, setRole] = useState<RegisterRole>('student');
  const [formData, setFormData] = useState({
    name: '',
    identifier: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate based on role
    const dataToValidate = role === 'student' 
      ? { name: formData.name, rollNumber: formData.identifier, phone: formData.phone, password: formData.password, confirmPassword: formData.confirmPassword }
      : { name: formData.name, facultyId: formData.identifier, phone: formData.phone, password: formData.password, confirmPassword: formData.confirmPassword };

    const schema = role === 'student' ? studentSchema : facultySchema;
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        const mappedPath = path === 'rollNumber' || path === 'facultyId' ? 'identifier' : path;
        fieldErrors[mappedPath] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      // Check if identifier already exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('roll_or_faculty_id', formData.identifier.toUpperCase())
        .maybeSingle();

      if (existing) {
        toast({
          title: 'Registration Failed',
          description: `This ${role === 'student' ? 'roll number' : 'faculty ID'} is already registered.`,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Create email from identifier
      const email = `${formData.identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@library.local`;
      const redirectUrl = `${window.location.origin}/`;

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          name: formData.name.trim(),
          role: role,
          roll_or_faculty_id: formData.identifier.toUpperCase(),
          phone: formData.phone,
          status: 'pending',
        });

        if (profileError) throw profileError;

        toast({
          title: 'Registration Successful!',
          description: 'Your account is pending approval by the librarian.',
        });

        navigate('/account-status', { state: { status: 'pending' } });
      }
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="font-serif text-2xl font-bold text-foreground">Create Account</h1>
              <p className="text-muted-foreground mt-1">Register to access the library</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  setRole('student');
                  setFormData(prev => ({ ...prev, identifier: '' }));
                  setErrors({});
                }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  role === 'student'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <GraduationCap className="w-6 h-6" />
                <span className="font-medium">Student</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('faculty');
                  setFormData(prev => ({ ...prev, identifier: '' }));
                  setErrors({});
                }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  role === 'faculty'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <User className="w-6 h-6" />
                <span className="font-medium">Faculty</span>
              </button>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name (as per ID card)</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier">
                  {role === 'student' ? 'Roll Number' : 'Faculty ID'}
                </Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder={role === 'student' ? 'e.g., 23481A12K9' : 'e.g., it_00001'}
                  value={formData.identifier}
                  onChange={handleChange}
                  className={errors.identifier ? 'border-destructive' : ''}
                />
                {errors.identifier && <p className="text-sm text-destructive">{errors.identifier}</p>}
                {role === 'student' && (
                  <p className="text-xs text-muted-foreground">
                    Format: Year (23/24/25) + College Code (48) + Type (1A/5A) + Branch (12) + ID (K9)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Register
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Register;
