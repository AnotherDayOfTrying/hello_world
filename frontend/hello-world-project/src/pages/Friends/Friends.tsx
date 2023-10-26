import React, {useState} from 'react'
import FriendsCard from './FriendCard'
import {PostData} from '../../components/feed/PostList/data/postsData'
import Leftbar from '../../components/leftbar/Leftbar';
import './friends.css'
import FriendSearch from './FriendSearch';

interface Friend {
    img: string;
    name: string;
    user_img: string;
    likes: number;
    liked: boolean;
  }

export default function Friends() {
    const [data, setData] = useState<Friend[]>(PostData);
    const handleSearch = (filteredFriend: Friend[]) => {
        setData(filteredFriend); 
      };
    const GetData = async () => {
        try {
        
            const response = await fetch('http://.../friendSearch/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
                });
            const responseData: Friend[] = await response.json();
            setData(responseData);
            console.log(responseData);
            } catch (error) {
                console.log(error);
            }
        }
    
    return (
        <>
            <div className='FriendsContainer'>
                <Leftbar/>
                <div className="friendsList">
                <FriendSearch onSearch={handleSearch} PostData={data}/>
                <h3 style={{marginTop: "1rem", marginLeft: "1rem"}}>Friends List</h3>
                    {data.length ? 
                    (data.map((data: any, id: number) => {  
                        return <FriendsCard data={data} />})
                    ): 
                    (PostData.map((data: any, id: number) => {
                    return <FriendsCard data={data}/>}))
                    }
                </div>
            </div>
        </>
      
    )
}
