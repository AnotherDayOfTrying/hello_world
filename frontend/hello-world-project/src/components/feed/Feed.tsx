import React, { useEffect, useState } from 'react'
import './feed.css'
import Share from '../../pages/Post/Post'
import Posts from './PostList/Posts'

interface FeedProps {
  private?: boolean;
  unlisted?: boolean;
  messages?: boolean;
}
const Feed: React.FC<FeedProps> = ({ private: isPrivate, unlisted: isUnlisted, messages: ismessages}: FeedProps) => {
  const [data, setData] = useState<any>(null);

  if (isPrivate) { 
    // get data from api
    
  }
  else if (isUnlisted) {
    // get data from api
    
  }
  else if (ismessages) {
    // get data from api
    
  }
  else {
    // get data from api
    
  }
  
  return (
    <div className='feed'>
      <Posts data={data}/>
      </div>
    
  )
}

export default Feed