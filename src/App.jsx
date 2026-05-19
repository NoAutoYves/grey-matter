import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Subjects from "./pages/Subjects";
import Profile from "./pages/Profile";
import ExerciseList from "./pages/ExerciseList";
import Exercise from "./pages/Exercise";
import ExerciseCompleted from "./pages/ExerciseCompleted";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/functional-comps/ProtectedRoute";
import ViewResults from "./pages/ViewResults";
import { fetchCSRFToken } from "./utils/api";

// Greymatter pages
import About from "./greymatter/About";
import Contact from "./greymatter/Contact";
import Careers from "./greymatter/Careers";
import Help from "./greymatter/Help";
import Terms from "./greymatter/Terms";
import Privacy from "./greymatter/Privacy";
import Cookies from "./greymatter/Cookies";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminExercises from "./pages/admin/AdminExercises";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

function App() {
  // Session check removed - no automatic redirect on expiry

  // Refresh CSRF token every 50 minutes (tokens expire in 60 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCSRFToken();
    }, 50 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Greymatter info pages */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/help" element={<Help />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/cookies" element={<Cookies />} />
      
      {/* Protected routes (require login) */}
      <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
      <Route path="/persona" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/exercises/:subject" element={<ProtectedRoute><ExerciseList /></ProtectedRoute>} />
      <Route path="/:subject/exercise" element={<ProtectedRoute><Exercise /></ProtectedRoute>} />
      <Route path="/exercise-completed" element={<ProtectedRoute><ExerciseCompleted /></ProtectedRoute>} />
      <Route path="/view-results" element={<ProtectedRoute><ViewResults /></ProtectedRoute>} />
      
      {/* Admin routes (require admin privileges) */}
      <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="exercises" element={<AdminExercises />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>
    </Routes>
  );
}

export default App;