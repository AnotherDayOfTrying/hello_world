import React, { useEffect, useState } from 'react'
import './feed.css'
import Posts from './PostList/Posts'
import { PostOutput, useGetAuthorsPosts, useGetPrivatePosts, useGetPublicPosts, useGetUnlistedPosts } from '../../api/post'
import { useAuth } from '../../providers/AuthProvider'
import { CircularProgress } from '@mui/material'
import { PAGE_TYPE } from '../../App'
import { enqueueSnackbar } from 'notistack'

interface FeedProps {
  type: PAGE_TYPE
  filter: string[]
}

const Feed: React.FC<FeedProps> = ({filter, type}: FeedProps) => {
  const {userInfo} = useAuth();
  const publicResponse = useGetPublicPosts(userInfo, type === PAGE_TYPE.PUBLIC)
  const privateResponse = useGetPrivatePosts(userInfo, type === PAGE_TYPE.PRIVATE)
  const unlistedResponse = useGetUnlistedPosts(userInfo, type === PAGE_TYPE.UNLISTED)
  const myResponse = useGetAuthorsPosts(userInfo, type === PAGE_TYPE.MY_POST)

  const response = {
    [PAGE_TYPE.PUBLIC]: publicResponse,
    [PAGE_TYPE.PRIVATE]: privateResponse,
    [PAGE_TYPE.UNLISTED]: unlistedResponse,
    [PAGE_TYPE.MY_POST]: myResponse,
  }[type]


  if (response.isError) {
    enqueueSnackbar('Unable to Fetch Posts', {variant: 'error'})
  }

  return (
    <div className='feed'>
      {
        publicResponse.isLoading ? 
          <CircularProgress/>
          :
          <Posts type={type} data={response.data?.reverse().filter((post) => {
            const categories: string[] = JSON.parse(post.categories || '[]')
            if (filter && filter.length > 0) {
              return categories.filter(value => filter.includes(value)).length > 0;
            } else {
              return true
            }
          })} />
      }
    </div>
  )
}

export default Feed