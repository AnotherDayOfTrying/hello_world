import React, {useState} from 'react'
import FriendsCard from './FriendCard'
import {PostData} from '../../components/feed/PostList/data/postsData'
import Leftbar from '../../components/leftbar/Leftbar';
import './friends.css'
import FriendSearch from './FriendSearch';



export default function Friends() {
    const [data, setData] = useState<any>(null);

    //get data from api
    
    return (
        <>
            <div className='FriendsContainer'>
                <Leftbar/>
                <div className="friendsList">
                <FriendSearch/>
                <h3 style={{marginTop: "1rem", marginLeft: "1rem"}}>Friends List</h3>
                    {data ? 
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
