import { useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Subjects from "./pages/Subjects";
import Profile from "./pages/Profile";
import ExerciseList from "./pages/ExerciseList";
import ExercisesByTopic from "./pages/ExercisesByTopic";
import Exercise from "./pages/Exercise";
import ExerciseCompleted from "./pages/ExerciseCompleted";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/functional-comps/ProtectedRoute";
import ScrollToTop from "./components/functional-comps/ScrollToTop";
import ViewResults from "./pages/ViewResults";
import HowItWorks from "./pages/HowItWorks";
import { fetchCSRFToken } from "./utils/api";

import About from "./components/greymatter/About";
import Contact from "./components/greymatter/Contact";
import Careers from "./components/greymatter/Careers";
import Help from "./components/greymatter/Help";
import Terms from "./components/greymatter/Terms";
import Privacy from "./components/greymatter/Privacy";
import Cookies from "./components/greymatter/Cookies";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminExercises from "./pages/admin/AdminExercises";
import AdminUserFeedback from "./pages/admin/AdminUserFeedback";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminErrorLogs from "./pages/admin/AdminErrorLogs";

const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));

function App() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCSRFToken();
    }, 50 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Greymatter info pages - Public */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/help" element={<Help />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/how-it-works" element={<HowItWorks />} />

        {/* Subjects and Topics - Public (Free to browse) */}
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/:subject/topic/:topicId" element={<ExercisesByTopic />} />
        <Route path="/:subject" element={<ExerciseList />} />

        {/* Exercises - Public (Free to take, sign up to save) */}
        <Route path="/:subject/exercise" element={<Exercise />} />
        <Route path="/exercise-completed" element={<ExerciseCompleted />} />

        {/* Results history - Protected */}
        <Route path="/view-results" element={<ProtectedRoute><ViewResults /></ProtectedRoute>} />

        {/* Profile - Protected */}
        <Route path="/persona" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin routes (require admin privileges) */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="exercises" element={<AdminExercises />} />
          <Route
            path="analytics"
            element={
              <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center", color: "#6846ff" }}>Loading analytics...</div>}>
                <AdminAnalytics />
              </Suspense>
            }
          />
          <Route path="activity" element={<AdminActivity />} />
          <Route path="feedback" element={<AdminUserFeedback />} />
          <Route path="errors" element={<AdminErrorLogs />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;