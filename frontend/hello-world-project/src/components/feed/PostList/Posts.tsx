import React from 'react'
import './posts.css'
import {PostData} from './data/postsData'
import PostCard from './PostCard'

export default function Posts() {
  return (
    <div className="posts">
        {PostData.map((post, id)=>{
            return <PostCard data={post}/>
            })}
    </div>
  )
}
