import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from "./pages/home/Home";
import ProtectedLayout from "./pages/auth/ProtectedLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Logout from "./pages/auth/Logout";
import Root from "./pages/root/Root";
import RootError from "./pages/root/RootError";
import AuthLayout from "./pages/auth/AuthLayout";
import Notifications from "./pages/Notifications/Notifications";
import Friends from "./pages/Friends/Friends";
import Post from "./pages/Post/Post";
import './App.css'


const App: React.FC = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
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
            <Route path="/private" element={<Home private/>} />
            <Route path="/unlisted" element={<Home unlisted/>} />
            <Route path="/post" element={<Post/>} />
            <Route path="/messages" element={<Home messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/friends" element={<Friends />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </div>
  );
} 

export default App;
