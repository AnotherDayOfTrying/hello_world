import React, { useEffect, useState } from 'react'
import './feed.css'
import Share from '../../pages/Post/Post'
import Posts from './PostList/Posts'
import APIURL, { getAuthorizationHeader } from "../../api/config"
import axios, { AxiosError } from "axios"

interface FeedProps {
  private?: boolean;
  unlisted?: boolean;
  messages?: boolean;
}
const Feed: React.FC<FeedProps> = ({ private: isPrivate, unlisted: isUnlisted, messages: ismessages}: FeedProps) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        if (isPrivate) {
          response = await axios.get(`${APIURL}/post/getprivate/`, {headers: {Authorization: getAuthorizationHeader()}});
        } else if (isUnlisted) {
          response = await axios.get(`${APIURL}/post/getunlisted/`, {headers: {Authorization: getAuthorizationHeader()}});
        } else if (ismessages) {
          response = await axios.get(`${APIURL}/author/getmessages/`, {headers: {Authorization: getAuthorizationHeader()}});
        } else {
          response = await axios.get(`${APIURL}/post/getpublic/`, {headers: {Authorization: getAuthorizationHeader()}});
        }
        console.log('Response:', response.data);
        const responseData: any[] = response.data.items;
        setData(responseData);
        console.log('Fetched posts:', responseData[0]);
      } catch (err: any) {
        if (err instanceof AxiosError) {
          console.error('API Error:', err.response?.data);
        } else {
          console.error('Unknown Error:', err);
        }
      }
    };

    fetchData();
  }, [isPrivate, isUnlisted, ismessages]);

  
  return (
    <div className='feed'>
      <Posts data={data}/>
      </div>
    
  )
}

export default Feed