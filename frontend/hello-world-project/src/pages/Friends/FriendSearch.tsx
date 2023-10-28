import React, { useState, useEffect } from 'react';
import './friendSearch.css'
import SearchIcon from '@mui/icons-material/Search';
import { PostData } from '../../components/feed/PostList/data/postsData';

interface Friend {
  img: string;
  name: string;
  user_img: string;
  likes: number;
  liked: boolean;
}

interface FriendSearchProps {
  onSearch: (filteredFriends: Friend[]) => void;
  PostData: Friend[];
}

 function FriendSearch({ onSearch, PostData }: FriendSearchProps) {
  const [userName, setUserName] = useState<string>('');

  const handleSearch = async () => {
    const filteredFriend = PostData.filter((friend) =>
    { return (friend.name.toLowerCase().includes(userName.toLowerCase()))});
    onSearch(filteredFriend);
  };
  
  return (
    <div className="friendSearch">
        <input type="text" placeholder="Search for a friend" 
          value={userName}
          onChange={(e) => {setUserName(e.target.value);}}/>
        <div className="searchIcon">
            <SearchIcon onClick={ handleSearch }/>
        </div>
        
    </div>
    
  )
}

export default FriendSearch
