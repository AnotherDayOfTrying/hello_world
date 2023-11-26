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
import EditProfile from "./pages/EditProfile/EditProfile";
import Post from "./pages/Post/Post";
import './App.css'
import Github from './pages/Github/Github';

const App: React.FC = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
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
            <Route path="/private" element={
              <>
                <div className="blur" style={{top: '-18%', right:'0'}}></div>
                <div className="blur" style={{top: '36%', left: '-8rem'}}></div>
                <Home private/>
              </>
              }/>
            <Route path="/unlisted" element={
              <>
                <div className="blur" style={{top: '-18%', right:'0'}}></div>
                <div className="blur" style={{top: '36%', left: '-8rem'}}></div>
                <Home unlisted/>
              </>
            }/>
            <Route path="/post" element={
              <>
                <div className="blur" style={{top: '-18%', right:'0'}}></div>
                <div className="blur" style={{top: '36%', left: '-8rem'}}></div>
                <Post />
              </>} />
            <Route path="/post/edit" element={
            <>
              <div className="blur" style={{top: '-18%', right:'0'}}></div>
              <div className="blur" style={{top: '36%', left: '-8rem'}}></div>
              <Post />
            </>} />
            <Route path="/messages" element={
              <>
                <div className="blur" style={{top: '-18%', right:'0'}}></div>
                <div className="blur" style={{top: '36%', left: '-8rem'}}></div>
                <Home messages />
              </>} />
            <Route path="/notifications" element={
              <>
                <div className="blur" style={{top: '-18%', right:'0'}}></div>
                <div className="blur" style={{top: '36%', left: '-8rem'}}></div>
                <Notifications />
              </>} />
            <Route path="/friends" element={
              <>
                <div className="blur" style={{top: '-18%', right:'0'}}></div>
                <div className="blur" style={{top: '36%', left: '-8rem'}}></div>
                <Friends /> 
              </>} />
            <Route path="/myposts" element={
            <>
              <div className="blur" style={{top: '-18%', right:'0'}}></div>
              <div className="blur" style={{top: '36%', left: '-8rem'}}></div>
              <Home myposts /> 
            </>} />
            <Route path="/editprofile" element={
            <>
              <div className="blur" style={{top: '-18%', right:'0'}}></div>
              <div className="blur" style={{top: '36%', left: '-8rem'}}></div>
              <EditProfile /> 
            </>} />
            <Route path="/githubActivity" element={
            <>
              <div className="blur" style={{top: '-18%', right:'0'}}></div>
              <div className="blur" style={{top: '36%', left: '-8rem'}}></div>
              <Github /> 
            </>} />
            </Route>
          </Route>
          <Route path="*" element={<RootError />}/>
        </Routes>
      </Router>
    </div>
  );
} 

export default App;
