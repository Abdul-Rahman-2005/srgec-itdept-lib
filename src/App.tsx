import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Public Pages
import Index from "./pages/Index";
import About from "./pages/About";
import SearchBooks from "./pages/SearchBooks";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AccountStatus from "./pages/AccountStatus";
import Setup from "./pages/Setup";
import NotFound from "./pages/NotFound";

// Librarian Pages
import LibrarianDashboard from "./pages/librarian/LibrarianDashboard";
import RegistrationManagement from "./pages/librarian/RegistrationManagement";
import ManageBooks from "./pages/librarian/ManageBooks";
import AddBook from "./pages/librarian/AddBook";
import BorrowRecords from "./pages/librarian/BorrowRecords";
import RecordBorrow from "./pages/librarian/RecordBorrow";
import ManageMagazines from "./pages/librarian/ManageMagazines";
import ManageJournals from "./pages/librarian/ManageJournals";
import CSPProjectTitles from "./pages/librarian/CSPProjectTitles";
import Reports from "./pages/librarian/Reports";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentSearch from "./pages/student/StudentSearch";
import StudentBorrowed from "./pages/student/StudentBorrowed";

// Faculty Pages
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultySearch from "./pages/faculty/FacultySearch";
import FacultyBorrowed from "./pages/faculty/FacultyBorrowed";

// Shared View Pages
import ViewMagazines from "./pages/ViewMagazines";
import ViewJournals from "./pages/ViewJournals";
import ViewCSPProjects from "./pages/ViewCSPProjects";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/search" element={<SearchBooks />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account-status" element={<AccountStatus />} />
            <Route path="/setup" element={<Setup />} />

            {/* Librarian Routes */}
            <Route path="/librarian" element={<LibrarianDashboard />} />
            <Route path="/librarian/registrations" element={<RegistrationManagement />} />
            <Route path="/librarian/books" element={<ManageBooks />} />
            <Route path="/librarian/add-book" element={<AddBook />} />
            <Route path="/librarian/borrows" element={<BorrowRecords />} />
            <Route path="/librarian/record-borrow" element={<RecordBorrow />} />
            <Route path="/librarian/magazines" element={<ManageMagazines />} />
            <Route path="/librarian/journals" element={<ManageJournals />} />
            <Route path="/librarian/csp-projects" element={<CSPProjectTitles />} />
            <Route path="/librarian/reports" element={<Reports />} />

            {/* Student Routes */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/search" element={<StudentSearch />} />
            <Route path="/student/borrowed" element={<StudentBorrowed />} />
            <Route path="/student/magazines" element={<ViewMagazines allowedRoles={['student']} />} />
            <Route path="/student/journals" element={<ViewJournals allowedRoles={['student']} />} />
            <Route path="/student/csp-projects" element={<ViewCSPProjects allowedRoles={['student']} />} />

            {/* Faculty Routes */}
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/search" element={<FacultySearch />} />
            <Route path="/faculty/borrowed" element={<FacultyBorrowed />} />
            <Route path="/faculty/magazines" element={<ViewMagazines allowedRoles={['faculty']} />} />
            <Route path="/faculty/journals" element={<ViewJournals allowedRoles={['faculty']} />} />
            <Route path="/faculty/csp-projects" element={<ViewCSPProjects allowedRoles={['faculty']} />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
