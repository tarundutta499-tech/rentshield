import { useAuth } from "../state/AuthProvider";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
}
