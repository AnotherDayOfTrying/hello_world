import Home from "./pages/home/Home";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './app.css'
import Notifications from "./pages/Notifications/Notifications";
import Friends from "./pages/Friends/Friends";
import Post from "./pages/Post/Post";

const App: React.FC = () => {
  return (
    <div className="App">
      <Router>
        <div className="blur" style={{top: '-18%', right:'0'}}></div>
        <div className="blur" style={{top: '36%', left: '-8rem'}}></div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/private" element={<Home private/>} />
          <Route path="/unlisted" element={<Home unlisted/>} />
          <Route path="/post" element={<Post/>} />
          <Route path="/messages" element={<Home messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/friends" element={<Friends />} />
        </Routes>
        
      </Router>
      
    </div>
  );
}

export default App;
