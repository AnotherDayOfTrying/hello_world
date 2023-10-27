import { useOutlet } from "react-router-dom";
import { AuthProvider } from "../../providers/AuthProvider";

// Provides the AuthProvier
const AuthLayout = () => {
  const outlet = useOutlet();

  return (
    <AuthProvider>{outlet}</AuthProvider>
  );
};

export default AuthLayout;