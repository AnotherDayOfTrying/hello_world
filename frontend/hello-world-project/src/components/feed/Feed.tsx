import React, { useEffect, useState } from 'react'
import './feed.css'
import Posts from './PostList/Posts'
import APIURL, { getAuthorizationHeader } from "../../api/config"
import axios, { AxiosError } from "axios"

interface FeedProps {
  private?: boolean;
  unlisted?: boolean;
  messages?: boolean;
  myposts?: boolean;
}
const Feed: React.FC<FeedProps> = ({ private: isPrivate, unlisted: isUnlisted, messages: ismessages, myposts: isMyPosts}: FeedProps) => {
  const [data, setData] = useState<any>(null);

  
  const fetchData = async () => {
    try {
      let response;
      const test = await axios.get('https://chimp-chat-1e0cca1cc8ce.herokuapp.com/posts/public/', {headers: {Authorization: 'Basic bm9kZS00MDQtdGVhbS1ub3QtZm91bmQ6Y2hpbXBjaGF0YXBp'}});
      // console.log("DATA")
      // console.log(test.data.items)


      test.data.items = test.data.items.map((post: any) => {
        return {
          text: post.content,
          privacy: post.visibility,
          author: post.author,
        }
      })

      // console.log(test.data.items)


      if (isPrivate) {
        response = await axios.get(`${APIURL}/post/getprivate/`, {headers: {Authorization: getAuthorizationHeader()}});
      } else if (isUnlisted) {
        response = await axios.get(`${APIURL}/post/getunlisted/`, {headers: {Authorization: getAuthorizationHeader()}});
      } else if (ismessages) {
        response = await axios.get(`${APIURL}/post/getmessages/`, {headers: {Authorization: getAuthorizationHeader()}});
      } else if (isMyPosts) {
        response = await axios.get(`${APIURL}/post/getowned/`, {headers: {Authorization: getAuthorizationHeader()}});
      }
      else {
        response = await axios.get(`${APIURL}/post/getpublic/`, {headers: {Authorization: getAuthorizationHeader()}});
      }

      console.log("DATA")
      const responseData: any = response.data.items;
      responseData.push(...test.data.items)
      setData(responseData);
      console.log('Fetched posts:', responseData);
    } catch (err: any) {
      if (err instanceof AxiosError) {
        console.error('API Error:', err.response?.data);
      } else {
        console.error('Unknown Error:', err);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [isPrivate, isUnlisted, ismessages, isMyPosts]); 

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