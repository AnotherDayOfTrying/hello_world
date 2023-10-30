import React, { useEffect, useState } from 'react'
import './feed.css'
import Share from '../../pages/Post/Post'
import Posts from './PostList/Posts'
import APIURL from "../../api/config"
import axios, { AxiosError } from "axios"

interface FeedProps {
  private?: boolean;
  unlisted?: boolean;
  messages?: boolean;
}
const Feed: React.FC<FeedProps> = ({ private: isPrivate, unlisted: isUnlisted, messages: ismessages}: FeedProps) => {
  const [data, setData] = useState<any>(null);

  if (isPrivate) { 
    // get data from api
  //   const getPrivatePosts = async (): Promise<any[] | undefined> => {
  //   try {
  //     const response = await axios.get(`${APIURL}/posts/private/`, {
  //       headers: {
  //         "Content-Type": "application/json",
          
  //       },
  //     });
  //     const responseData: any[]  = response.data;
  //     if (responseData) {
  //       console.log('private posts:', responseData);
  //       setData(responseData);

  //     }
  //     return responseData;
  //   } catch (err: any) {
  //     if (err instanceof AxiosError) {
  //       return err.response?.data;
  //     } else {
  //       throw err;
  //     }
  //   }
  // };
    
  }
  else if (isUnlisted) {
    // get data from api
    // const getUnlistedPosts = async (): Promise<any[] | undefined> => {
    //   try {
    //     const response = await axios.get(`${APIURL}/posts/unlisted/`, {
    //       headers: {
    //         "Content-Type": "application/json",
            
    //       },
    //     });
    //     const responseData: any[]  = response.data;
    //     if (responseData) {
    //       console.log('unlisted posts:', responseData);
    //       setData(responseData);
  
    //     }
    //     return responseData;
    //   } catch (err: any) {
    //     if (err instanceof AxiosError) {
    //       return err.response?.data;
    //     } else {
    //       throw err;
    //     }
    //   }
    // };
    
  }
  else if (ismessages) {
    // get data from api
    // const getMessagesPosts = async (): Promise<any[] | undefined> => {
    //   try {
    //     const response = await axios.get(`${APIURL}/author/messages/`, {
    //       headers: {
    //         "Content-Type": "application/json",
            
    //       },
    //     });
    //     const responseData: any[]  = response.data;
    //     if (responseData) {
    //       console.log('message posts:', responseData);
    //       setData(responseData);
  
    //     }
    //     return responseData;
    //   } catch (err: any) {
    //     if (err instanceof AxiosError) {
    //       return err.response?.data;
    //     } else {
    //       throw err;
    //     }
    //   }
    // };
  }
  else {
    // get data from api
    // const getPublicPosts = async (): Promise<any[] | undefined> => {
    //   try {
    //     const response = await axios.get(`${APIURL}/posts/public/`, {
    //       headers: {
    //         "Content-Type": "application/json",
            
    //       },
    //     });
    //     const responseData: any[]  = response.data;
    //     if (responseData) {
    //       console.log('public posts:', responseData);
    //       setData(responseData);
  
    //     }
    //     return responseData;
    //   } catch (err: any) {
    //     if (err instanceof AxiosError) {
    //       return err.response?.data;
    //     } else {
    //       throw err;
    //     }
    //   }
    // };
    
  }
  
  return (
    <div className='feed'>
      <Posts data={data}/>
      </div>
    
  )
}

export default Feed