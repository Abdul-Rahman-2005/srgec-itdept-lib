import { Link, useLocation } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Clock, XCircle, Home } from 'lucide-react';

const AccountStatus = () => {
  const location = useLocation();
  const status = location.state?.status || 'pending';

  const isPending = status === 'pending';

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-secondary">
        <div className="w-full max-w-md text-center">
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border animate-scale-in">
            {isPending ? (
              <>
                <div className="w-20 h-20 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-amber" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Account Pending Approval
                </h1>
                <p className="text-muted-foreground mb-6">
                  Your registration request has been submitted. The librarian will review 
                  your account and approve it shortly. You will receive an SMS notification 
                  once your account is activated.
                </p>
                <div className="p-4 bg-amber/10 rounded-lg border border-amber/20 mb-6">
                  <p className="text-sm text-amber-dark">
                    Please wait for approval before attempting to log in.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Account Rejected
                </h1>
                <p className="text-muted-foreground mb-6">
                  Unfortunately, your registration request has been rejected. 
                  This may be due to incorrect information provided during registration.
                </p>
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20 mb-6">
                  <p className="text-sm text-destructive">
                    Please contact the library for more information or register with correct details.
                  </p>
                </div>
              </>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/">
                <Button variant="outline">
                  <Home className="w-4 h-4" />
                  Go to Home
                </Button>
              </Link>
              {!isPending && (
                <Link to="/register">
                  <Button>Register Again</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default AccountStatus;
