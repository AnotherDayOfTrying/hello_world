import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LoginInterface, SignUpInterface, login, signup, verifySession, logout } from "../api/auth"
import { useSnackbar } from "notistack";
import { AuthorOutput } from "../api/author";

const AuthContext = createContext<any>({});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [userInfo, setUserInfo] = useState<AuthorOutput>()
  const [verifiedSession, setVerifiedSession] = useState<boolean>(false) 
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  useEffect(() => {
    verifySession()
      .then((author) => {
        setUser(localStorage.getItem('user_token') || '')
        setUserId(localStorage.getItem('user_id') || '')
        if (author) {
          setUserInfo(author)
          setVerifiedSession(true)
        }
      })
  },[user]) // only run once on load

  // call this function to sign up a user
  const signupUser = async(data: SignUpInterface) => {
    try {
      const response = await signup(data)
      if (response.token) {
        enqueueSnackbar("Signed up!", {variant: 'success'})
        navigate("/login")
      }
      return response
    } catch {
      enqueueSnackbar("Unable to sign up! Try again later.", {variant: 'error'})
    }
  }

  // call this function when you want to authenticate the user
  const loginUser = async (data: LoginInterface) => {
    try {
      const response = await login(data);
      setUser(response.token)
      localStorage.setItem('user_token', response.token || '')
      localStorage.setItem('user_id', response.data || '')
      if (await verifySession()) {
        enqueueSnackbar("Logged in!", {variant: 'success'})
        navigate("/home") 
      }
  
      return response
    } catch {
      enqueueSnackbar("Unable to login! Try again later.", {variant: 'error'})
    }
  };

  // call this function to sign out logged in user
  const logoutUser = async () => {
    await logout()
    enqueueSnackbar("Logged out!", {variant: 'success'})
    setUser('')
    navigate("/login", { replace: true })
  };

  const value = useMemo(
    () => ({
      user,
      userId,
      userInfo,
      verifiedSession,
      signupUser,
      loginUser,
      logoutUser,
    }),
    [user, userId, userInfo, verifiedSession]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};