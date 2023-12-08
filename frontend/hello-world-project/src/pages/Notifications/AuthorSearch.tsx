import SearchIcon from '@mui/icons-material/Search';
import './authorSearch.css'


interface AuthorSearchProps {
  authorSearch: string
  setAuthorSearch: (author: string) => void;
}

function AuthorSearch({authorSearch, setAuthorSearch}: AuthorSearchProps) {
  return (
    <div className="AuthorSearch">
        <input type="text" placeholder="Send a friend request" 
          value={authorSearch}
          onChange={(e) => {setAuthorSearch(e.target.value);}}/>
        <div className="searchIcon">
            <SearchIcon />
        </div>
    </div>
  )
}

export default AuthorSearch
