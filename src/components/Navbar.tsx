import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/search', label: 'Search Books' },
  ];

  const getDashboardLink = () => {
    if (!profile) return null;
    switch (profile.role) {
      case 'librarian':
        return '/librarian';
      case 'faculty':
        return '/faculty';
      case 'student':
        return '/student';
      default:
        return null;
    }
  };

  const dashboardLink = getDashboardLink();

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-primary group-hover:bg-primary/90 transition-colors">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-xl text-foreground">
              IT Library
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "text-sm",
                    location.pathname === link.href && "bg-secondary text-secondary-foreground"
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user && profile ? (
              <>
                {profile.status === 'active' && dashboardLink && (
                  <Link to={dashboardLink}>
                    <Button variant="outline" size="sm">
                      <User className="w-4 h-4 mr-1" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    {profile.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded capitalize">
                    {profile.role}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={signOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-2">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start">
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="border-t border-border my-2" />
              {user && profile ? (
                <>
                  {profile.status === 'active' && dashboardLink && (
                    <Link to={dashboardLink} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
