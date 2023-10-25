import React from 'react'
import './friendSearch.css'
import SearchIcon from '@mui/icons-material/Search';

function friendSearch() {
  return (
    <div className="friendSearch">
        <input type="text" placeholder="Search for a friend" />
        <div className="searchIcon">
            <SearchIcon />
        </div>
        
    </div>
    
  )
}

export default friendSearch
