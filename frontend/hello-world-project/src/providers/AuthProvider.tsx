import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginInterface, SignUpInterface, login, signup, verifySession } from "../api/auth";

const AuthContext = createContext<any>({});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<boolean>(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   verifySession()
  //     .then((verified) =>{ console.log(verified); setUser(verified) })
  // },[])

  const signupUser = async(data: SignUpInterface) => {
    const response = await signup(data)
    if (await verifySession()) {
      setUser(true) // !!! change this to user token
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
  };

  // call this function to sign out logged in user
  const logoutUser = () => {
    setUser(false);
    navigate("/login", { replace: true });
  };

  const verifyUserSession = async () => {
    setUser(await verifySession())
  }

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