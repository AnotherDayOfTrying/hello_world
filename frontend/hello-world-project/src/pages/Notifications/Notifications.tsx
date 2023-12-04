import React, { useState, useEffect, useCallback } from 'react';
import Leftbar from '../../components/leftbar/Leftbar';
import AuthorSearch from './AuthorSearch';
import NotificationCard from './NotificationCard';
import './notifications.css';
import axios from "axios";
import APIURL, { getAuthorizationHeader, getAuthorId } from "../../api/config";
import { useSnackbar } from 'notistack';

export default function Notifications() {
  const [data, setData] = useState<any>(null);
  const {enqueueSnackbar} = useSnackbar();
  

    const getFriendRequests = useCallback(async () => {
      try {
        const response = await axios.get(`${APIURL}/authors/${getAuthorId()}/requests`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: getAuthorizationHeader(),
          },
        });
        const friendRequests: any[] = response.data;
        console.log('Friend Requests:', friendRequests);

        const requestsWithAuthors = await Promise.all(
          friendRequests.map(async (request) => {
            // split the url to get the actor id
            const actorId = request.actor.id.split('/').pop();
            const authorResponse = await axios.get(`${APIURL}/authors/${actorId}`, {headers: {Authorization: getAuthorizationHeader(),}});
            const authorData = {
              ...request,
              actor: authorResponse.data,
            };
            console.log('Author Data:', authorData);
            return authorData;
          })
        );
        console.log('Friend Requests:', requestsWithAuthors);
        setData(friendRequests);

      } catch (error) {
        enqueueSnackbar('Unable to fetch notifications.', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        console.log(error);
      }
    }, []);

    useEffect(() => {
      getFriendRequests();
    }, [getFriendRequests]);

  return (
    <>
      <div className='notificationContainer'>
        <Leftbar />
        <div className="notificationsList">
          <AuthorSearch />
          <h3 style={{ marginTop: "1rem", marginLeft: "1rem" }}>Your Notifications</h3>
          {data && data.length > 0 ? (
            data.map((item: any, id: number) => {
              return <NotificationCard data={item} getFriendRequests={getFriendRequests} key={id} />;
            })
          ) : ( <h4 style={{alignSelf: 'center' }}>No Friend Requests</h4>)}
        </div>
      </div>
    </>
  );
}
