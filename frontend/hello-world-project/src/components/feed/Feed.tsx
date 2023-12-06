import React, { useEffect, useState } from 'react'
import './feed.css'
import Posts from './PostList/Posts'
import { getAuthorsPostsAsync, getPosts, getPrivatePostsAsync, getPublicPostsAsync, getUnlistedPostsAsync } from '../../api/post'
import { useAuth } from '../../providers/AuthProvider'

interface FeedProps {
  private?: boolean;
  unlisted?: boolean;
  myposts?: boolean;
}
const Feed: React.FC<FeedProps> = ({ private: isPrivate, unlisted: isUnlisted, myposts: isMyPosts}: FeedProps) => {
  const [data, setData] = useState<any>(null);
  const {userInfo} = useAuth();

  
  const fetchData = async () => {
    try {
      let response;
      
      if (isPrivate) {
        response = await getPrivatePostsAsync(userInfo)
      } else if (isUnlisted) {
        response = await getUnlistedPostsAsync(userInfo)
      } else if (isMyPosts) {
        response = (await getAuthorsPostsAsync(userInfo))?.items
      } else {
        response = await getPublicPostsAsync(userInfo)
        const posts = (await getPosts(userInfo)).items
        response!.push(...posts)
      }
      // sort by to post being most recent
      response?.reverse()
      if (response)
        setData(response)
    } catch (err: any) {
      console.error('Unknown Error:', err);
    }
  };

  useEffect(() => {
    if (userInfo)
      fetchData();
  }, [isPrivate, isUnlisted, isMyPosts]); 

  const Reload = () => {
    fetchData();    
  }

  if (isMyPosts){
    return (
      <div className='feed'>
        <Posts Reload={Reload} myposts data={data}/>
        </div>
      
    )
  }
  else if (isPrivate){ 
    let transformedData = data ? data.flat() : []
    return (
      <div className='feed'>
        <Posts Reload={Reload}  data={transformedData}/>
      </div>
      
    )
  }
  else{
    return (
      <div className='feed'>
        <Posts Reload={Reload} data={data}/>
      </div>
      
    )
  }
}

export default Feed