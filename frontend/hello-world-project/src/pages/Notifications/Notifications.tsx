import { useState } from 'react';
import Leftbar from '../../components/leftbar/Leftbar';
import AuthorSearch from './AuthorSearch';
import NotificationCard from './NotificationCard';
import './notifications.css';
import { useGetAuthors } from '../../api/author';
import { AuthorCard } from './AuthorCard';
import { useAuth } from '../../providers/AuthProvider';
import { useGetFriendRequests, useGetFriends } from '../../api/friend';
import { CircularProgress } from '@mui/material';

export default function Notifications() {
  const [authorSearch, setAuthorSearch] = useState<string>('')
  const {userInfo} = useAuth()
  const friends = useGetFriends(userInfo)
  const authors = useGetAuthors()
  const friendRequests = useGetFriendRequests(userInfo)


  const filterAuthorSearch = (author: string) => {
    setAuthorSearch(author)
  }

  return (
    <>
      <div className='notificationContainer'>
        <Leftbar />
        <div className="notificationsList">
          <AuthorSearch authorSearch={authorSearch} setAuthorSearch={filterAuthorSearch} />
          <h3 style={{ marginTop: "1rem", marginLeft: "1rem" }}>Your Notifications</h3>
          {friendRequests.data && friendRequests.data.length > 0 ? (
            friendRequests.data.map((friendRequest, index) => {
              return <NotificationCard data={friendRequest} key={index} />;
            })
          ) : ( <h4 style={{alignSelf: 'center' }}>No Friend Requests</h4>)}
          <h3 style={{ marginTop: "1rem", marginLeft: "1rem" }}>Authors</h3>
          {authors.isLoading && <div style={{textAlign: 'center'}}><CircularProgress /></div>}
          {authors.data && authors.data.length > 0 ? (
            authors
              .data
              .sort((a, b) => a.displayName.localeCompare(b.displayName))
              .filter((author) => {
                if (userInfo.displayName === author.displayName) { // filter out self
                  return false
                }
                if (friends.data && friends.data.length > 0) { //filter out friends
                  if(!!friends.data.find((friendship) => friendship.actor.displayName === author.displayName)) {
                    return false
                  }
                }
                if (authorSearch) {
                  return RegExp(`^${authorSearch}.*`).test(author.displayName)
                } else {
                  return true
                }
              })
              .map((author) => {
                return <AuthorCard data={author} key={author.id} />;
              })
          ) : ( <h4 style={{alignSelf: 'center' }}>No Authors</h4>)}
        </div>
      </div>
    </>
  );
}
