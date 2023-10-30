import React from 'react'
import './notificationCard.css'
import APIURL from "../../api/config"
import axios, { AxiosError } from "axios"

type NotificationData = {
  id: number,
  reciever: string,
  status: number,
  sender: {type: string,
  id: string,
  url: string,
  displayName: string,
  profilePicture: string,
  github: string,}
  };
  
  type NotificationCardProps = {
    data: any;
    getFriendRequests: () => Promise<void>;
  };

function NotificationCard({ data, getFriendRequests }: NotificationCardProps) {
  const handleAccept  = async (Id: number): Promise<any[] | undefined> => {
    try {
      const response = await axios.post(`${APIURL}/frequests/respond/${Id}/`,
      {
        action: "accept",
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const responseData: any = response.data;
      console.log('accepting request:', responseData);
      getFriendRequests();
      return responseData;
    } catch (error) {
      console.log(error);
    }
    

  };
  const handleReject  = async (Id: number): Promise<any[] | undefined> => {
    try {
      const response = await axios.post(`${APIURL}/frequests/respond/${Id}/`,
      {
        action: "decline",
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const responseData: any = response.data;
      console.log('rejecting request: ', responseData);
      getFriendRequests();
      return responseData;
    } catch (error) {
      console.log(error);
    }
    

  };
  console.log("data: ",data);
  return (
    <div className="notificationCard">
      <img src={data.sender.profilePicture} alt="" className="notificationCardImg" />
      <div className="notificationCardUsername">
          <span >{data.sender.displayName}</span>
      </div>
      <button onClick={() => handleAccept(data.id)} className='acceptButton'>Accept</button>
      <button onClick={() => handleReject(data.id)} className='rejectButton'>Reject</button>
    </div>
  )
}

export default NotificationCard
