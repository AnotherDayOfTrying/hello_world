import React, {useState} from 'react'
import SearchIcon from '@mui/icons-material/Search';
import './authorSearch.css'


interface Author {
  id: number;
  userName: string;
}

function AuthorSearch() {
  const [userName, setUserName] = useState<string>('');
  const [filteredAuthor, setFilteredAuthor] = useState<any[]>([]);

  const handleSearch = async () => {
    try {
      
      // const response = await fetch('http://.../authSearch/', {
      //     method: 'GET',
      //     headers: {
      //       'Content-Type': 'application/json'
      //     }
      //   });
      // const responseData: Author[] = await response.json();
      // console.log(responseData);
      // const filteredAuthor = responseData.filter((author) =>
      //     author.userName.toLowerCase().includes(userName.toLowerCase())
      //   );
      // setFilteredAuthor(filteredAuthor);
      // try{
      //   const response = await fetch('http://.../authSearch/', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     body:JSON.stringify({
      //       "userName": filteredAuthor
      //     })
      //   });
      // } catch (error) {
      //   console.log("Author not found");

      // }
    } catch (error) {
      console.log(error);
    }}
  
  return (
    <div className="AuthorSearch">
        <input type="text" placeholder="Send a friend request" 
          value={userName}
          onChange={(e) => setUserName(e.target.value)}/>
        <div className="searchIcon">
            <SearchIcon onClick={handleSearch}/>
        </div>
    </div>
    
      
    
  )

}

export default AuthorSearch
