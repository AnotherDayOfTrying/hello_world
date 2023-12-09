import React, {useState, useEffect} from 'react';
import Leftbar from '../../components/leftbar/Leftbar';
import Activity from './Activity';
import './github.css';
import axios from 'axios';
import { APIURL, getAuthorizationHeader, getAuthorId } from '../../api/config';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router';

const Github: React.FC = () => {
  const [data, setData] = React.useState<any[]>([]);
  const [username, setUsername] = useState<string>('');
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate()

  useEffect(() => {
    getAuthor();
  }, []);

  useEffect(() => {
    fetchData();
  }, [username]);

  const getAuthor = async () => {
    try {
      const response = await axios.get(`${APIURL}/authors/${getAuthorId()}`, {
        headers: {
          Authorization: getAuthorizationHeader(),
        },
      });
      const github = response.data.github;
      const path = github.split('/');
      const username = path[path.length - 1]; 
      setUsername(username);
      fetchData();
    } catch (e) {

      console.error(e);
    }
  };
  
    const fetchData = async () => {
      try {
        if (username !== '') {
          const response = await axios.get(`https://api.github.com/users/${username}/events`);
          setData(response.data);
        }
      } catch (error: any) {
        if (error.response.status === 403) {
          enqueueSnackbar('Github API rate limit exceeded\nPlease try again later', {variant: 'warning', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        }
        console.error('Error fetching data:', error);
      }
    }
  

  return (
    <div className="container">
      <Leftbar  />z
        <div className="activityList">
        {data.length > 0 ? (
          data.map((activity) => <Activity key={activity.id} activity={activity} />)
        ) : (
          <div className='editProfile'>
            <p>Seems like your profile does not have a valid GitHub URL</p>
            <button className='button' onClick={() => navigate('/editProfile')}> Edit Profile</button>
          </div>
        )}
        </div>
    </div>
      
      
  );
};

export default Github;
