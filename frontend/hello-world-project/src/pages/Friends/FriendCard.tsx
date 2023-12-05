import React, {useState} from 'react'
import './friendCard.css'
import { NavLink } from 'react-router-dom';
import APIURL, { getAuthorizationHeader, getAuthorId } from "../../api/config"
import axios, { AxiosError } from "axios"
import { useSnackbar } from 'notistack';


type FriendsCardProps = {
  data: any;
  shareList?: boolean;
  onClick?: () => void;
  getFriends?: () => Promise<void>;
};


function FriendsCard({data, shareList, onClick, getFriends}: FriendsCardProps) {
  const profilePicture = data.actor.profile_picture ? data.actor.profile_picture : 'https://cmput404-project-backend-a299a47993fd.herokuapp.com/media/profilepictures/default-profile-picture.jpg';
  const {enqueueSnackbar} = useSnackbar();

  const handleUnfriend = async () => {
    const actorId = data.actor.id.split('/').pop();
    try {
      const response = await axios.delete(`${APIURL}/authors/${getAuthorId()}/followers/${actorId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthorizationHeader(),
        }
      });
      const responseData: any = response.data;
      console.log('rejecting request: ', responseData);
      if (getFriends) {
        getFriends();
      }
    } catch (err) {
      enqueueSnackbar('Unable to delete friend. Try again later.', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
      console.log(err);
    }
  };
  if (shareList) {
    return(
      <div className="shareListCard" onClick={onClick}>
        <img src={`${APIURL}${data.actor.profilePicture}`} alt="" className="shareListImg" />
        <div className="shareListUsername">
          <span>{data.actor.displayName}</span>
        </div>
    </div>
    )
  }

  else {
    return (
      
      <div className="FriendCard">
        <img src={`${data.actor.profilePicture}`} alt="" className="friendCardImg" />
        <div className="friendCardUsername">
            <span >{data.actor.displayName}</span>
        </div>
        <button onClick={handleUnfriend} className='Unfriend'>Unfriend</button>
      </div>
    )
  }
}

export default FriendsCard
