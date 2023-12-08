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
}

const Feed: React.FC<FeedProps> = ({type}: FeedProps) => {
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
          <Posts type={type} data={response.data?.reverse()} />
      }
    </div>
  )
}

export default Feed