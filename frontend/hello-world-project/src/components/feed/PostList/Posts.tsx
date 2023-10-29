import React, {useState} from 'react'
import './posts.css'
import {PostData} from './data/postsData'
import PostCard from './PostCard'

interface PostsProps {
  data: any;
}

const Posts: React.FC<PostsProps> = ({ data }) => {
  return (
    <div className="posts">
      {data ? 
      (data.map((post: any, id: number) => {
        return <PostCard data={post}/>})
      ): 
      (PostData.map((post: any, id: number) => {
        return <PostCard data={post}/>}))
    }
    </div>
  )
}

export default Posts
