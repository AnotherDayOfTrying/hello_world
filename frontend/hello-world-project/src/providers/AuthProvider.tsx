import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LoginInterface, SignUpInterface, login, signup, verifySession, logout, fetchNodes } from "../api/auth"
import { useSnackbar } from "notistack";
import { AuthorOutput, getAuthorAsync } from "../api/author";

const AuthContext = createContext<any>({});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [userInfo, setUserInfo] = useState<AuthorOutput>()
  const [verifiedSession, setVerifiedSession] = useState<boolean>(false)
  const [hosts, setHosts] = useState<string[]>()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  useEffect(() => {
    verifySession()
      .then((author) => {
        setUser(localStorage.getItem('user_token') || '')
        setUserId(localStorage.getItem('user_id') || '')
        if (author) {
          setUserInfo(author)
        }
        setVerifiedSession(true)
      })
    fetchNodes()
      .then((nodes) => setHosts(nodes))
  },[user]) // only run once on load

  // call this function to sign up a user
  const signupUser = async(data: SignUpInterface) => {
    try {
      const response = await signup(data)
      if (response.token) {
        enqueueSnackbar("Signed up!", {variant: 'success', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        navigate("/login")
      }
      return response
    } catch {
      enqueueSnackbar("Unable to sign up! Try again later.", {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
    }
  }

  // call this function when you want to authenticate the user
  const loginUser = async (data: LoginInterface) => {
    try {
      const response = await login(data);
      setUser(response.token)
      localStorage.setItem('user_token', response.token || '')
      localStorage.setItem('user_id', response.data || '')
      if (await verifySession() && userInfo) {
        enqueueSnackbar("Logged in!", {variant: 'success', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        navigate("/home")
      }
  
      return response
    } catch {
      enqueueSnackbar("Unable to login! Try again later.", {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
    }
  };

  // call this function to sign out logged in user
  const logoutUser = async () => {
    await logout()
    enqueueSnackbar("Logged out!", {variant: 'success', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
    setUser('')
    navigate("/login", { replace: true })
  };

  const refreshUser = async () => {
    if (userInfo)
      setUserInfo(await getAuthorAsync(userInfo))
  }

  const value = useMemo(
    () => ({
      user,
      userId,
      userInfo,
      verifiedSession,
      hosts,
      signupUser,
      loginUser,
      logoutUser,
      refreshUser
    }),
    [user, userId, userInfo, verifiedSession, hosts]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};