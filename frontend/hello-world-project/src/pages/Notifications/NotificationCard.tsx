import React from 'react'
import './notificationCard.css'

type NotificationData = {
    name: string;
    user_img: string;
  };
  
  type NotificationCardProps = {
    data: NotificationData;
  };

function NotificationCard({data}: NotificationCardProps) {
  return (
    <div className="notificationCard">
      <img src={data.user_img} alt="" className="notificationCardImg" />
      <div className="notificationCardUsername">
          <span >{data.name}</span>
      </div>
      <button className='acceptButton'>Accept</button>
      <button className='rejectButton'>Reject</button>
    </div>
  )
}

export default NotificationCard
