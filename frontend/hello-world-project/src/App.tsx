import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {SnackbarProvider} from 'notistack'
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
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

export enum PAGE_TYPE {
  PUBLIC,
  PRIVATE,
  UNLISTED,
  MY_POST,
}

const queryClient = new QueryClient()

const App: React.FC = () => {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}>
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
                      <Home type={PAGE_TYPE.PUBLIC}/>
                    </>
                  }/>
                  <Route path="/private" element={
                    <>
                      <div className="blur" style={{top: '-18%', right:'0'}}></div>
                      <div className="blur" style={{top: '36%', left: '-8rem'}}></div>
                      <Home type={PAGE_TYPE.PRIVATE}/>
                    </>
                    }/>
                  <Route path="/unlisted" element={
                    <>
                      <div className="blur" style={{top: '-18%', right:'0'}}></div>
                      <div className="blur" style={{top: '36%', left: '-8rem'}}></div>
                      <Home type={PAGE_TYPE.UNLISTED}/>
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
                    <Home type={PAGE_TYPE.MY_POST}/> 
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
                <Route path="*" element={<RootError />}/>
              </Route>
            </Routes>
          </Router>
        </SnackbarProvider>
      </QueryClientProvider>
    </div>
  );
} 

export default App;
