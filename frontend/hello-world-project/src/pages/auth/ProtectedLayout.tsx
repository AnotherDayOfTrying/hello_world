import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

const ProtectedLayout = () => {
  const { user, verifiedSession } = useAuth();
  if (verifiedSession && user) {
    return (
      <Outlet />
    )
  } else if (!verifiedSession) { // waiting for server to respond
    return (
      <div></div>
    )
  } else {
    return <Navigate to="/login" />;
  }
};

export default ProtectedLayout;