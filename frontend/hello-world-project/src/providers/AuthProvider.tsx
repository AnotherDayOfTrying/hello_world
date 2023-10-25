import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";
import signup, { SignUpInterface } from "../api/signup"
import login, { LoginInterface } from "../api/login";

const AuthContext = createContext<any>({});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useLocalStorage("user", null);
  const navigate = useNavigate();


  const signupUser = async(data: SignUpInterface) => {
    const response = await signup(data)
    if (response.data) {
      setUser(response.data.displayName) // !!! change this to user token
      navigate("/home")
    }

    return response
  }

  // call this function when you want to authenticate the user
  const loginUser = async (data: LoginInterface) => {
    const response = await login(data);
    if (response.data) {
      setUser(response.data.displayName); // !!! change this to user token
      navigate("/home");
    }
    
  };

  // call this function to sign out logged in user
  const logoutUser = () => {
    setUser(null);
    navigate("/", { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      signupUser,
      loginUser,
      logoutUser,
    }),
    [user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};