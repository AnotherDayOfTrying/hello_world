import React from 'react'
import './feed.css'
import Share from './Share'
import Posts from './PostList/Posts'

export default function feed() {
  return (
    <div className='feed'>
      <Share/>
      <Posts/>
      </div>
    
  )
}
