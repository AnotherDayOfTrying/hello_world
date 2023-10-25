import React from 'react'
import ProfileCard from './profileCard';
import LeftbarList from './LeftbarList';
import './leftbar.css'
import { NavLink } from 'react-router-dom';


export default function Leftbar() {
  return (
    <div className='leftbar'>
      
      <ProfileCard />
      <LeftbarList />
      <NavLink to='/post'>
        <button className='leftbarButton'>
          Post
        </button>
      </NavLink>
    
    </div>
  )
}
