import React, {useState, useEffect} from 'react'
import SearchIcon from '@mui/icons-material/Search';
import './authorSearch.css'
import { APIURL, getAuthorizationHeader, getAuthorId } from "../../api/config"
import axios, { AxiosError } from "axios"
import { useSnackbar } from 'notistack';


function AuthorSearch() {
  const [displayName, setDisplayName] = useState<string>('');
  const [filteredAuthor, setFilteredAuthor] = useState<any[]>([]);
  const [user, setUser] = useState<any>({})
  const {enqueueSnackbar} = useSnackbar();


  const getAuthor = async () => {
    try {
      const response = await axios.get(`${APIURL}/authors/${getAuthorId()}`, {
        headers: {
          Authorization: getAuthorizationHeader()
        }
      })
      setUser(response.data)
    } catch (e) {
      // enqueueSnackbar('Unable to fetch your details', {variant: "error", anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
      console.error(e)
    }
  }

  useEffect(() => {
    getAuthor()
  }, [])

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
          const authorId = filteredAuthor[0].id.split('/').pop();
          sendFriendRequest(filteredAuthor[0], authorId);
        } else {
          // enqueueSnackbar(`Unable to find author '${displayName}'`, {variant: 'warning', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
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
  
  const sendFriendRequest = async (author:any, authorId: string): Promise<any[] | undefined> => {
          console.log('Author ID:', authorId);
          const requestBody = {
            type: "Follow",
            summary: `${user.displayName} wants to be a friend to you`,
            actor: user,
            object:author,
          };
          let auth = ''
          let url = author.host
          console.log('URL:', url);
          if (url === 'https://cmput404-project-backend-a299a47993fd.herokuapp.com/' || 'http://localhost:3000/') {
            auth = getAuthorizationHeader();
            url = APIURL + '/';
          } else if (url === 'https://chimp-chat-1e0cca1cc8ce.herokuapp.com/') {
            auth = 'Basic node-hello-world:chimpchatapi';  
          } else if (url === 'https://webwizards-backend-952a98ea6ec2.herokuapp.com/') {
            auth = 'Basic node-hello-world:socialpassword';
          } else if (url === ' https://distributed-network-37d054f03cf4.herokuapp.com/') {
            auth = 'Basic node-hello-world:node-hello-world';
          }
          try {
            const response = await axios.post(`${author.id}/inbox`, requestBody,
            {
              headers: {
                Authorization: auth,
              }
            });
            const status = response.status;
            console.log('Status:', status);
            if (status === 201) {
              enqueueSnackbar("Friend request sent successfully!", {variant: 'success', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
            }
            const responseData: any = response.data;
            return responseData;
          } catch (error: any) {
            console.log(error);
            if (error.response?.status === 400) {
              const key = enqueueSnackbar("You are already friends with this user, or you already sent them a request!", {variant: 'info', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
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
