import React from 'react'
import './friendCard.css'

type FriendData = {
  name: string;
  user_img: string;
};

type FriendsCardProps = {
  data: FriendData;
};

function FriendsCard({data}: FriendsCardProps) {
  return (
    
    <div className="FriendCard">
      <img src={data.user_img} alt="" className="friendCardImg" />
      <div className="friendCardUsername">
          <span >{data.name}</span>
      </div>
      <button className='friendCardButton'>Message</button>
    </div>
  )
}

export default FriendsCard
