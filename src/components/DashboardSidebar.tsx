import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Users,
  BookPlus,
  Library,
  ClipboardList,
  Search,
  BookMarked,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const librarianNavItems: NavItem[] = [
  { href: '/librarian', label: 'Dashboard', icon: Home },
  { href: '/librarian/registrations', label: 'Registrations', icon: Users },
  { href: '/librarian/books', label: 'Manage Books', icon: Library },
  { href: '/librarian/add-book', label: 'Add Book', icon: BookPlus },
  { href: '/librarian/magazines', label: 'Magazines', icon: BookOpen },
  { href: '/librarian/journals', label: 'Journals', icon: BookOpen },
  { href: '/librarian/csp-projects', label: 'CSP Projects', icon: ClipboardList },
  { href: '/librarian/borrows', label: 'Borrow Records', icon: ClipboardList },
  { href: '/librarian/record-borrow', label: 'Record Borrow', icon: BookMarked },
  { href: '/librarian/reports', label: 'Reports', icon: ClipboardList },
];

const studentNavItems: NavItem[] = [
  { href: '/student', label: 'Dashboard', icon: Home },
  { href: '/student/search', label: 'Search Books', icon: Search },
  { href: '/student/borrowed', label: 'My Books', icon: BookMarked },
  { href: '/student/magazines', label: 'Magazines', icon: BookOpen },
  { href: '/student/journals', label: 'Journals', icon: BookOpen },
  { href: '/student/csp-projects', label: 'CSP Projects', icon: ClipboardList },
];

const facultyNavItems: NavItem[] = [
  { href: '/faculty', label: 'Dashboard', icon: Home },
  { href: '/faculty/search', label: 'Search Books', icon: Search },
  { href: '/faculty/borrowed', label: 'My Books', icon: BookMarked },
  { href: '/faculty/magazines', label: 'Magazines', icon: BookOpen },
  { href: '/faculty/journals', label: 'Journals', icon: BookOpen },
  { href: '/faculty/csp-projects', label: 'CSP Projects', icon: ClipboardList },
];

export function DashboardSidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!profile) return null;

  const getNavItems = () => {
    switch (profile.role) {
      case 'librarian':
        return librarianNavItems;
      case 'student':
        return studentNavItems;
      case 'faculty':
        return facultyNavItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sidebar-accent">
              <BookOpen className="w-5 h-5 text-sidebar-primary" />
            </div>
            <span className="font-serif font-bold text-lg">IT Library</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-sidebar-border">
          <p className="font-medium truncate">{profile.name}</p>
          <p className="text-sm text-sidebar-foreground/70 capitalize">{profile.role}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                end={item.href === '/librarian' || item.href === '/student' || item.href === '/faculty'}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "hover:bg-sidebar-accent text-sidebar-foreground"
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
