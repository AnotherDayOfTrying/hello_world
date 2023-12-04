import React, { useState, useEffect, useCallback } from 'react';
import Leftbar from '../../components/leftbar/Leftbar';
import AuthorSearch from './AuthorSearch';
import NotificationCard from './NotificationCard';
import './notifications.css';
import axios, { AxiosError } from "axios";
import APIURL, { getAuthorizationHeader } from "../../api/config";
import { useSnackbar } from 'notistack';

export default function Notifications() {
  const [data, setData] = useState<any>(null);
  const {enqueueSnackbar} = useSnackbar();

    const getFriendRequests = useCallback(async () => {
      try {
        const response = await axios.get(`${APIURL}/authors/requests/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: getAuthorizationHeader(),
          },
        });
        const friendRequests: any[] = response.data;

        const requestsWithAuthors = await Promise.all(
          friendRequests.map(async (request) => {
            const authorResponse = await axios.get(`${APIURL}/authors/${request.sender}`, {headers: {Authorization: getAuthorizationHeader(),}});
            const authorData = {
              ...request,
              sender: authorResponse.data,
            };
            console.log('Author Data:', authorData);
            return authorData;
          })
        );
        console.log('Friend Requests:', requestsWithAuthors);
        setData(requestsWithAuthors);

      } catch (error) {
        enqueueSnackbar('Unable to fetch notifications.', {variant: 'error'})
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
