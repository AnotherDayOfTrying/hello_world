import React, { useState, useEffect } from 'react';
import './friendSearch.css'
import SearchIcon from '@mui/icons-material/Search';



type FriendSearchProps = {
  onSearch: (filteredFriends: any) => void;
  getFriends: () => void;
  data: any[];
}

 function FriendSearch({ onSearch, getFriends, data }: FriendSearchProps) {
  const [displayName, setdisplayName] = useState<string>('');

  const handleSearch = async () => {
    const filteredFriend = data.filter((item) =>
    item.sender.displayName.toLowerCase() === displayName.toLowerCase());
    if (filteredFriend.length > 0) {
      console.log('Filtered Friend:', filteredFriend);
      onSearch(filteredFriend);
    }
    else {  
      console.log('No Friend Found');
      getFriends();
    }
  };
  
  return (
    <div className="friendSearch">
        <input type="text" placeholder="Search for a friend" 
          value={displayName}
          onChange={(e) => {setdisplayName(e.target.value);}}/>
        <div className="searchIcon">
            <SearchIcon onClick={ handleSearch }/>
        </div>
        
    </div>
    
  )
}

export default FriendSearch
