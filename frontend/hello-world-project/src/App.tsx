import { Outlet, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom"
import Home from "./pages/home/Home";
import './App.css'
import ProtectedLayout from "./pages/auth/ProtectedLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Logout from "./pages/auth/Logout";
import Root from "./pages/root/Root";
import RootError from "./pages/root/RootError";
import AuthLayout from "./pages/auth/AuthLayout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AuthLayout />} errorElement={<RootError/>}>
      <Route path="/" element={<Root/>} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="logout" element={<Logout />} />
      <Route element={<ProtectedLayout/>}>
        <Route path="home" element={
          <>
            <div className="blur" style={{top: '-18%', right:'0'}}></div>
            <div className="blur" style={{top: '36%', left: '-8rem'}}></div>
            <Home/>
          </>
        }/>
      </Route>
    </Route>
  )
)


function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
} 

export default App;
