import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LoginInterface, SignUpInterface, login, signup, verifySession, logout } from "../api/auth"

const AuthContext = createContext<any>({});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<string>('')
  const [verifiedSession, setVerifiedSession] = useState<boolean>(false) 
  const navigate = useNavigate()

  useEffect(() => {
    verifySession()
      .then((data) => {
        setUser(localStorage.getItem('user_token') || '')
        setVerifiedSession(true)
      })
  },[]) // only run once on load

  // call this function to sign up a user
  const signupUser = async(data: SignUpInterface) => {
    const response = await signup(data)
    if (response.token) {
      navigate("/login")
    }
    return response
  }

  // call this function when you want to authenticate the user
  const loginUser = async (data: LoginInterface) => {
    const response = await login(data);
    setUser(response.token)
    localStorage.setItem('user_token', response.token || '')
    if (await verifySession()) {
      navigate("/home")
    }

    return response
  };

  // call this function to sign out logged in user
  const logoutUser = async () => {
    await logout()
    setUser('')
    navigate("/login", { replace: true })
  };

  const value = useMemo(
    () => ({
      user,
      verifiedSession,
      signupUser,
      loginUser,
      logoutUser,
    }),
    [user, verifiedSession]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};