import React, {useState} from 'react';
import Leftbar from '../../components/leftbar/Leftbar';
import AuthorSearch from './AuthorSearch';
import NotificationCard from './NotificationCard';
import './notifications.css';
import {PostData} from '../../components/feed/PostList/data/postsData'


export default function Notifications() {
  const [data, setData] = useState<any>(null);

  return (
    <>
      <div className='notificationContainer'>
          <Leftbar/>
          <div className="notificationsList">
          <AuthorSearch/>
          <h3 style={{marginTop: "1rem", marginLeft: "1rem"}}>Your Notifications</h3>
              {data ? 
              (data.map((data: any, id: number) => {  
                  return <NotificationCard data={data} />})
              ): 
              (PostData.map((data: any, id: number) => {
              return <NotificationCard data={data}/>}))
              }
          </div>
      </div>
    </>
  )
}
