import React, {useState, useEffect, useCallback} from 'react'
import FriendsCard from './FriendCard'
import Leftbar from '../../components/leftbar/Leftbar';
import './friends.css'
import FriendSearch from './FriendSearch';
import { APIURL, getAuthorizationHeader, getAuthorId } from "../../api/config"
import axios, { AxiosError } from "axios"
import { useSnackbar } from 'notistack';
import { useGetFriends } from '../../api/friend';
import { useAuth } from '../../providers/AuthProvider';



export default function Friends() {
    const [data, setData] = useState<any>(null);
    const {enqueueSnackbar} = useSnackbar();
    const {userInfo} = useAuth()
    const friends = useGetFriends(userInfo)

    const handleSearch = (filteredFriend: any) => {
        setData(filteredFriend); 
    };
    
    const isDataEmpty = data ? data.length === 0 : true
    return (
        <>
            <div className='FriendsContainer'>
                <Leftbar/>
                <div className="friendsList">
                <FriendSearch onSearch={handleSearch} data={data}/>
                <h3 style={{marginTop: "1rem", marginLeft: "1rem"}}>Friends List</h3>
                    {friends.data && friends.data.items.length > 0 ?
                    (friends.data.items.map((data, id: number) => {  
                      const actorId = data.id.split('/').pop();
                      if (actorId !== getAuthorId()) {
                        return <FriendsCard data={data} key={id}/>
                      }
                      })
                    ): 
                    (<h4 style={{alignSelf: 'center' }}>No Friends</h4>)
                    }
                </div>
            </div>
        </>
      
    )
}
