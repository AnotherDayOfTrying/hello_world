import React from 'react'
import SearchIcon from '@mui/icons-material/Search';
import './authorSearch.css'

function AuthorSearch() {
  return (
    <div className="AuthorSearch">
        <input type="text" placeholder="Send a friend request" />
        <div className="searchIcon">
            <SearchIcon />
        </div>
    </div>
      
    
  )
}

export default AuthorSearch
