import React, {useState} from 'react'
import './friendCard.css'
import { NavLink } from 'react-router-dom';
import APIURL, { getAuthorizationHeader, getAuthorId } from "../../api/config"
import axios, { AxiosError } from "axios"
import { useSnackbar } from 'notistack';
import { FriendshipOutput } from '../../api/friend';
import { PostOutput, SendPostInput, editPostAsync, sendPostAsync } from '../../api/post';
import { useAuth } from '../../providers/AuthProvider';


type FriendsCardProps = {
  data: FriendshipOutput;
  post?: PostOutput;
  shareList?: boolean;
  getFriends?: () => Promise<void>;
};


function FriendsCard({data, shareList, getFriends, post}: FriendsCardProps) {
  const {enqueueSnackbar} = useSnackbar();
  const {userInfo} = useAuth()

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

  const handleShare = async () => {
    await sendPostAsync(data.actor.id, {
      'type': 'post',
      'author': userInfo,
      'object': post!.id,
    })

    await editPostAsync(post!.id, {...post!, visibility: 'FRIENDS', unlisted: false })
    enqueueSnackbar(`Successfully sent to ${data.actor.displayName}`, {variant: 'success'})
  }

  if (shareList) {
    return(
      <div className="shareListCard" onClick={handleShare}>
        <img src={`${data.actor.profilePicture}`} alt="" className="shareListImg" />
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
