import React, {useState} from 'react'
import './friendCard.css'
import { NavLink } from 'react-router-dom';
import { APIURL, getAuthorizationHeader, getAuthorId } from "../../api/config"
import axios, { AxiosError } from "axios"
import { useSnackbar } from 'notistack';
import { FriendshipOutput } from '../../api/friend';
import { PostOutput, useSendPost, useEditPost } from '../../api/post';
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
  const editPostHandler = useEditPost(post!)
  const sendPostHandler = useSendPost()

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
      if (getFriends) {
        getFriends();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleShare = async () => {
    sendPostHandler.mutate({
      author: data.actor,
      sendPostInput: post!,
    })
    editPostHandler.mutate({
      post: post!,
      postInput: {
        ...post!,
        visibility: 'FRIENDS',
        unlisted: false
      }
    })
    enqueueSnackbar(`Successfully sent to ${data.actor.displayName}`, {variant: 'success'})
  }

  if (shareList) {
    return(
      <div className="shareListCard" onClick={handleShare}>
        <img src={`${data.actor.profileImage}`} alt="" className="shareListImg" />
        <div className="shareListUsername">
          <span>{data.actor.displayName}</span>
        </div>
    </div>
    )
  }

  else {
    return (
      
      <div className="FriendCard">
        <img src={`${data.actor.profileImage}`} alt="" className="friendCardImg" />
        <div className="friendCardUsername">
            <span >{data.actor.displayName}</span>
        </div>
        <button onClick={handleUnfriend} className='Unfriend'>Unfriend</button>
      </div>
    )
  }
}

export default FriendsCard
