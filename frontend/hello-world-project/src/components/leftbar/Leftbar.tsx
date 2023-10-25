import React from 'react'
import ProfileCard from './profileCard';
import LeftbarList from './LeftbarList';
import './leftbar.css'

export default function Leftbar() {
  return (
    <div className='leftbar'>
      
      <ProfileCard />
      <LeftbarList />
      <button className='leftbarButton'>
        Post
      </button>
    
    </div>
  )
}
