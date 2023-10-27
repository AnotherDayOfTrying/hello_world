import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LoginInterface, SignUpInterface, login, signup, verifySession } from "../api/auth"

const AuthContext = createContext<any>({});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<boolean>(false)
  const [verifiedSession, setVerifiedSession] = useState<boolean>(false) 
  const navigate = useNavigate()

  useEffect(() => {
    verifySession()
      .then((verified) => {
        setUser(verified);
        setVerifiedSession(true)
      })
  },[]) // only run once on load

  // call this function to sign up a user
  const signupUser = async(data: SignUpInterface) => {
    const response = await signup(data)
    if (await verifySession()) {
      setUser(true)
      navigate("/home")
    }
    return response
  }

  // call this function when you want to authenticate the user
  const loginUser = async (data: LoginInterface) => {
    const response = await login(data);
    if (await verifySession()) {
      setUser(true);
      navigate("/home");
    }

    return response
  };

  // call this function to sign out logged in user
  const logoutUser = () => {
    setUser(false);
    navigate("/login", { replace: true });
  };

  // call this function to verify the current session token
  const verifyUserSession = async () => {
    setUser(await verifySession())
  }

  const value = useMemo(
    () => ({
      user,
      verifiedSession,
      signupUser,
      loginUser,
      logoutUser,
      verifyUserSession,
    }),
    [user, verifiedSession]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};