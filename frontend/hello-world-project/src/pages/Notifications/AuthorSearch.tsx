import React, {useState} from 'react'
import SearchIcon from '@mui/icons-material/Search';
import './authorSearch.css'
import APIURL from "../../api/config"
import axios, { AxiosError } from "axios"
import send from 'send';


axios.defaults.withCredentials = true // required to send session cookies with api requests
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'x-csrftoken'




function AuthorSearch() {
  const [displayName, setDisplayName] = useState<string>('');
  const [filteredAuthor, setFilteredAuthor] = useState<any[]>([]);

  const handleSearch = async (): Promise<any[] | undefined> => {
    try {
      const response = await axios.get(`${APIURL}/auth/authors/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseData: any[]  = response.data.authors;
      if (responseData) {
        console.log('Fetched authors:', responseData);
        const filteredAuthor = responseData.filter((author) =>
          author.displayName.toLowerCase().includes(displayName.toLowerCase())
        );
        setFilteredAuthor(filteredAuthor);
        console.log(filteredAuthor);
        if (filteredAuthor.length > 0) {
          sendFriendRequest(filteredAuthor[0].id);
        }
      }
      return responseData;
    } catch (err: any) {
      if (err instanceof AxiosError) {
        return err.response?.data;
      } else {
        throw err;
      }
    }

  };

  
  const sendFriendRequest = async (authorId: string): Promise<any[] | undefined> => {
          console.log('Author ID:', authorId);
          try {
            const response = await axios.post(`${APIURL}/auth/frequests/send/`,
            {
              receiver_id: authorId,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              }
            });
            const responseData: any = response.data;
            console.log('Friend request response:', responseData);
            return responseData;
          } catch (error) {
            console.log(error);
          }
          
        };
  

  return (
    <div className="AuthorSearch">
        <input type="text" placeholder="Send a friend request" 
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}/>
        <div className="searchIcon">
            <SearchIcon onClick={handleSearch}/>
        </div>
    </div>
    
      
    
  )

}

export default AuthorSearch
