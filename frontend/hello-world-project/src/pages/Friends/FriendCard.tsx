import React, {useState} from 'react'
import './friendCard.css'
import { NavLink } from 'react-router-dom';
import APIURL from "../../api/config"
import axios, { AxiosError } from "axios"


type FriendsCardProps = {
  data: any;
  shareList?: boolean;
  onClick?: () => void;
  getFriends?: () => Promise<void>;
};


function FriendsCard({data, shareList, onClick, getFriends}: FriendsCardProps) {
  const profilePicture = data.sender.profile_picture ? data.sender.profile_picture : 'https://cmput404-project-backend-a299a47993fd.herokuapp.com/media/profilepictures/default-profile-picture.jpg';
  
  const handleMessage = async () => {
    // try {
    //   const response = await axios.post(`${APIURL}/friend/message/${data.id}`, {
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });
    //   const responseData = await response.data;
    //   console.log(responseData);
    // } catch (err) {
    //   console.log(err);
    // }
  };

  const handleUnfriend = async () => {
    try {
      const response = await axios.post(`${APIURL}/frequests/delete/${data.id}/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseData = await response.data;
      console.log(responseData);
      if (getFriends) {
        getFriends();
      }
    } catch (err) {
      console.log(err);
    }
  };
  if (shareList) {
    return(
      <div className="shareListCard" onClick={onClick}>
        <img src={profilePicture} alt="" className="shareListImg" />
        <div className="shareListUsername">
          <span>{data.sender.displayName}</span>
        </div>
    </div>
    )
  }

  else {
    return (
      
      <div className="FriendCard">
        <img src={profilePicture} alt="" className="friendCardImg" />
        <div className="friendCardUsername">
            <span >{data.sender.displayName}</span>
        </div>
        <button onClick={handleMessage} className='Message'>Message</button>
        <button onClick={handleUnfriend} className='Unfriend'>Unfriend</button>
      </div>
    )
  }
}

export default FriendsCard
