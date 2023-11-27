import React, {useState, useEffect, useCallback} from 'react'
import FriendsCard from './FriendCard'
import Leftbar from '../../components/leftbar/Leftbar';
import './friends.css'
import FriendSearch from './FriendSearch';
import APIURL, { getAuthorizationHeader } from "../../api/config"
import axios, { AxiosError } from "axios"
import { useSnackbar } from 'notistack';



export default function Friends() {
    const [data, setData] = useState<any>(null);
    const {enqueueSnackbar} = useSnackbar();

    const handleSearch = (filteredFriend: any) => {
        setData(filteredFriend); 
    };

    const getFriends = useCallback(async () => { 
        try {
        const response = await axios.get(`${APIURL}/authors/friends/`, {
            headers: {
            "Content-Type": "application/json",
            Authorization: getAuthorizationHeader(),
            },
        });
        const friends: any[] = response.data;

        const FriendInfo = await Promise.all(
            friends.map(async (request) => {
            const authorResponse = await axios.get(`${APIURL}/authors/${request.sender}`, {headers: {Authorization: getAuthorizationHeader(),}});
            const authorData = {
              ...request,
              sender: authorResponse.data,
            };
            console.log('Friend Data:', authorData);
            return authorData;
          })
        );
        console.log('Friends:', FriendInfo);
        setData(FriendInfo);

      } catch (error) {
        enqueueSnackbar('Unable to fetch friends. Try again later.', {variant: 'error'})
        console.log(error);
      }
    }, []);

    useEffect(() => {
        getFriends();
      }, [getFriends]);
    
    return (
        <>
            <div className='FriendsContainer'>
                <Leftbar/>
                <div className="friendsList">
                <FriendSearch onSearch={handleSearch} getFriends={getFriends} data={data}/>
                <h3 style={{marginTop: "1rem", marginLeft: "1rem"}}>Friends List</h3>
                    {data ? 
                    (data.map((data: any, id: number) => {  
                        return <FriendsCard data={data}  getFriends={getFriends} key={id}/>})
                    ): 
                    (<h4 style={{alignSelf: 'center' }}>No Friends</h4>)
                    }
                </div>
            </div>
        </>
      
    )
}
