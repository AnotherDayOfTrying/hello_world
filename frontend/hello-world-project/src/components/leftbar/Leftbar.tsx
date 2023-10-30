import React from 'react'
import ProfileCard from './profileCard';
import LeftbarList from './LeftbarList';
import './leftbar.css'
import { NavLink } from 'react-router-dom';
import { useAuth } from "../../providers/AuthProvider"


export default function Leftbar() {
  const { logoutUser } = useAuth();

  const handleLogOut = () => {
      logoutUser();
  
  }
  return (
    <div className='leftbar'>
      
      <ProfileCard />
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

