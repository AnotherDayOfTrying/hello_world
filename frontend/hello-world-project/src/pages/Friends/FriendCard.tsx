import React, {useState} from 'react'
import './friendCard.css'
import { NavLink } from 'react-router-dom';
import { APIURL, getAuthorizationHeader, getAuthorId } from "../../api/config"
import axios, { AxiosError } from "axios"
import { useSnackbar } from 'notistack';
import { FriendshipOutput, useUnfriend } from '../../api/friend';
import { PostOutput, useSendPost, useEditPost } from '../../api/post';
import { useAuth } from '../../providers/AuthProvider';
import { AuthorOutput } from '../../api/author';


type FriendsCardProps = {
  data: AuthorOutput;
  post?: PostOutput;
  shareList?: boolean;
};


function FriendsCard({data, shareList, post}: FriendsCardProps) {
  const {enqueueSnackbar} = useSnackbar();
  const {userInfo} = useAuth()
  const editPostHandler = useEditPost(post!)
  const sendPostHandler = useSendPost()
  const unfriendHanlder = useUnfriend()

  const handleShare = async () => {
    sendPostHandler.mutate({
      author: data,
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
    enqueueSnackbar(`Successfully sent to ${data.displayName}`, {variant: 'success'})
  }

  const handleUnfriend = async () => {
    unfriendHanlder.mutate({
      author: userInfo,
      actor: data
    })
  }

  if (shareList) {
    return(
      <div className="shareListCard" onClick={handleShare}>
        <img src={`${data.profileImage}`} alt="" className="shareListImg" />
        <div className="shareListUsername">
          <span>{data.displayName}</span>
        </div>
    </div>
    )
  }

  else {
    return (
      
      <div className="FriendCard">
        <img src={`${data.profileImage}`} alt="" className="friendCardImg" />
        <div className="friendCardUsername">
            <span >{data.displayName}</span>
        </div>
        <button onClick={handleUnfriend} className='Unfriend'>Unfriend</button>
      </div>
    )
  }
}

export default FriendsCard
