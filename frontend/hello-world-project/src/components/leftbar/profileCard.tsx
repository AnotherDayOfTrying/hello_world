import React from 'react'
import './profileCard.css'

export default function profileCard() {
  return (
    <div className='profileCard'>
      <div className='profileImages'>
        <img className='profile' src='/assets/person/5.jpg' alt='' />
        <img className='background' src='/assets/post/4.jpg' alt='' />
      </div>
      <div className='profileName'>
        <span>Zendaya </span>
        <span>Actress</span>
      </div>
    </div>
  )
}
