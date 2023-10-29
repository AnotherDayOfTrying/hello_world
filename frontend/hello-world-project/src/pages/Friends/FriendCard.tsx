import React, {useState} from 'react'
import './friendCard.css'
import { NavLink } from 'react-router-dom';


type FriendData = {
  name: string;
  user_img: string;
};

interface FriendsCardProps {
  data: FriendData;
  shareList?: boolean;
  onClick?: () => void;
};


const FriendsCard : React.FC<FriendsCardProps> = ({data, shareList, onClick}: FriendsCardProps) => {
  
  if (shareList) {
    return(
      <div className="shareListCard" onClick={onClick}>
        <img src={data.user_img} alt="" className="shareListImg" />
        <div className="shareListUsername">
          <span>{data.name}</span>
        </div>
    </div>
    )
    
  }
  else {
    return (
      
      <div className="FriendCard">
        <img src={data.user_img} alt="" className="friendCardImg" />
        <div className="friendCardUsername">
            <span >{data.name}</span>
        </div>
        <button className='Message'>Message</button>
        <button className='Unfriend'>Unfriend</button>
      </div>
    )
  }
}

export default FriendsCard
