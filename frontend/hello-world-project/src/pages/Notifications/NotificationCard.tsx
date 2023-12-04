import React, {useEffect, useState} from 'react'
import './notificationCard.css'
import APIURL, { getAuthorizationHeader, getAuthorId } from "../../api/config"
import axios, { AxiosError } from "axios"
import { useSnackbar } from 'notistack';

  
  type NotificationCardProps = {
    data: any;
    getFriendRequests: () => Promise<void>;
  };

function NotificationCard({ data, getFriendRequests }: NotificationCardProps) {
  const profilePicture = data.actor.profile_picture 
  const {enqueueSnackbar} = useSnackbar();

  const [user, setUser] = useState<any>({})


  const getAuthor = async () => {
    try {
      const response = await axios.get(`${APIURL}/authors/${getAuthorId()}`, {
        headers: {
          Authorization: getAuthorizationHeader()
        }
      })
      setUser(response.data)
    } catch (e) {
      enqueueSnackbar('Unable to fetch your details', {variant: "error", anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
      console.error(e)
    }
  }

  useEffect(() => {
    getAuthor()
  }, [])

  const handleAccept  = async (): Promise<any[] | undefined> => {

    const requestBody = {
      type: "Follow",
      summary: `${user.displayName} accepted your friend request`,
      actor: data.actor,
      object:user,
    };
    const actorId = data.actor.id.split('/').pop();
    try {
      const response = await axios.put(`${APIURL}/authors/${getAuthorId()}/followers/${actorId}`,requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthorizationHeader(),
        }
      });
      const responseData: any = response.data;
      console.log('accepting request:', responseData);
      getFriendRequests();
      return responseData;
    } catch (error) {
      enqueueSnackbar('Unable to accept friend request. Try again later.', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
      console.log(error);
    }
    

  };
  const handleReject  = async (): Promise<any[] | undefined> => {
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
      getFriendRequests();
      return responseData;
    } catch (error) {
      enqueueSnackbar('Unable to decline friend request. Try again later.', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
      console.log(error);
    }
    

  };
  console.log("data: ",data);
  return (
    <div className="notificationCard">
      <img src={`${data.actor.profilePicture}`} alt="" className="notificationCardImg" />
      <div className="notificationCardUsername">
          <span >{data.actor.displayName}</span>
      </div>
      <button onClick={() => handleAccept()} className='acceptButton'>Accept</button>
      <button onClick={() => handleReject()} className='rejectButton'>Reject</button>
    </div>
  )
}

export default NotificationCard
