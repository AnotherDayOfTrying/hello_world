import React, {useEffect} from 'react'
import ProfileCard from './profileCard';
import LeftbarList from './LeftbarList';
import './leftbar.css'
import { NavLink } from 'react-router-dom';
import { useAuth } from "../../providers/AuthProvider"

interface LeftbarProps {
  reload?: boolean;
}

export default function Leftbar({reload: isreload}: LeftbarProps) {
  const { logoutUser } = useAuth();
  const [Reload, setReload] = React.useState<any>(false);

  useEffect(() => {
    setReload(isreload);
  }, [isreload])


  const handleLogOut = () => {
      logoutUser();
  }
  return (
    <div className='leftbar'>
      
      <ProfileCard Reload={Reload}/>
      <LeftbarList />
      <div className="leftbarButtons">
        <button  onClick={handleLogOut} className='leftbarButton'>
          Log Out
        </button>
        <NavLink to='/post'>
          <button className='leftbarButton'>
            Post
          </button>
      </NavLink>
      </div>
      
    
    </div>
  )
}

