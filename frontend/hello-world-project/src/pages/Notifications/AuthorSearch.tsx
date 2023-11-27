import React, {useState} from 'react'
import SearchIcon from '@mui/icons-material/Search';
import './authorSearch.css'
import APIURL, { getAuthorizationHeader } from "../../api/config"
import axios, { AxiosError } from "axios"
import { useSnackbar } from 'notistack';


function AuthorSearch() {
  const [displayName, setDisplayName] = useState<string>('');
  const [filteredAuthor, setFilteredAuthor] = useState<any[]>([]);
  const {enqueueSnackbar} = useSnackbar();

  const handleSearch = async (): Promise<any[] | undefined> => {
  
    try {
      let requestURL = `${APIURL}/authors/`
      let responseData = []
      while (requestURL) {
        const response = await axios.get(requestURL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: getAuthorizationHeader(),
          },
        });

        responseData.push(...response.data.items)
        requestURL = response.data.pagination.next
      }
      if (responseData) {
        console.log('Fetched authors:', responseData);
        const filteredAuthor = responseData.filter((author) =>
          author.displayName.toLowerCase() === displayName.toLowerCase()
        );
        setFilteredAuthor(filteredAuthor);
        console.log(filteredAuthor);
        if (filteredAuthor.length > 0) {
          sendFriendRequest(filteredAuthor[0].id);
        } else {
          enqueueSnackbar(`Unable to find author '${displayName}'`, {variant: 'warning'})
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
            const response = await axios.post(`${APIURL}/frequests/send/`,
            {
              receiver_id: authorId,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: getAuthorizationHeader(),
              }
            });
            const status = response.status;
            console.log('Status:', status);
            if (status === 200) {
              enqueueSnackbar("Friend request sent successfully!", {variant: 'success'})
            }
            const responseData: any = response.data;
            return responseData;
          } catch (error: any) {
            console.log(error);
            if (error.response.status === 400) {
              enqueueSnackbar("You are already friends with this user, or you already sent them a request!", {variant: 'info'})
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
    </div>
  )

}

export default AuthorSearch
