import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/api";

function ProtectedRoute({ children, requireAdmin = false }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("You need to be logged in to access this page.");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest(`${import.meta.env.VITE_API_URL}/persona/profile`);
        
        if (response.status === 401) {
          setIsAuthenticated(false);
          setShowMessage(true);
          setTimeout(() => {
            navigate("/login");
          }, 2500);
        } else if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setIsAdmin(data.is_admin || false);
          
          // Check if admin access is required
          if (requireAdmin && !data.is_admin) {
            setMessage("Admin access required. You do not have permission to view this page.");
            setShowMessage(true);
            setTimeout(() => {
              navigate("/");
            }, 2500);
          }
        } else {
          setIsAuthenticated(false);
          setShowMessage(true);
          setTimeout(() => {
            navigate("/login");
          }, 2500);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthenticated(false);
        setShowMessage(true);
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      }
    };
    
    checkAuth();
  }, [navigate, requireAdmin]);

  if (showMessage) {
    return (
      <div className="auth-message-container">
        <div className="auth-message">
          <p>{message}</p>
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  return isAuthenticated ? children : null;
}

export default ProtectedRoute;