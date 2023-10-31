import React, {useState} from 'react'
import SearchIcon from '@mui/icons-material/Search';
import './authorSearch.css'
import APIURL from "../../api/config"
import axios, { AxiosError } from "axios"
import Popup from 'reactjs-popup';


axios.defaults.withCredentials = true // required to send session cookies with api requests
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'x-csrftoken'

function AuthorSearch() {
  const [displayName, setDisplayName] = useState<string>('');
  const [filteredAuthor, setFilteredAuthor] = useState<any[]>([]);
  const [message, setMessage] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);

  const handleSearch = async (): Promise<any[] | undefined> => {
  
    try {
      const response = await axios.get(`${APIURL}/authors/`, {
        headers: {
          "Content-Type": "application/json",
          
        },
      });
      const responseData: any[]  = response.data.items;
      if (responseData) {
        console.log('Fetched authors:', responseData);
        const filteredAuthor = responseData.filter((author) =>
          author.displayName.toLowerCase() === displayName.toLowerCase()
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

  const showPopUp = (message: string) => {
    setMessage(message);
    setOpen(true);
    console.log('Open:', open);
    // Close the popup after 3 seconds (3000 milliseconds)
    setTimeout(() => {
    setOpen(false);
  }, 3000);
  }
  
  const sendFriendRequest = async (authorId: string): Promise<any[] | undefined> => {
          console.log('Author ID:', authorId);
          try {
            const response = await axios.post(`${APIURL}/frequests/send/`,
            {
              receiver_id: authorId,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              }
            });
            const status = response.status;
            console.log('Status:', status);
            if (status === 200) {
              showPopUp("Friend request sent successfully!")
            }
            const responseData: any = response.data;
            console.log('Friend request response:', responseData);
            return responseData;
          } catch (error: any) {
            console.log(error);
            if (error.response === 400) {
              showPopUp("You are already friends with this user, or you already sent them a request!")
            }
          };
        }
  

  return (
    <div className="AuthorSearch">
        <input type="text" placeholder="Send a friend request" 
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}/>
        <div className="searchIcon">
            <SearchIcon onClick={handleSearch}/>
        </div>
        <Popup  open={open}  >
          <p>{message}</p>
        </Popup>
    
    </div>
    
  )

}

export default AuthorSearch
