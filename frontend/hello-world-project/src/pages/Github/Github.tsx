import React, {useState, useEffect} from 'react';
import Leftbar from '../../components/leftbar/Leftbar';
import Activity from './Activity';
import './github.css';
import axios from 'axios';
import APIURL, { getAuthorizationHeader } from '../../api/config';

const Github: React.FC = () => {
  const [data, setData] = React.useState<any[]>([]);
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    getAuthor();
  }, []);

  useEffect(() => {
    fetchData();
  }, [username]);

  const getAuthor = async () => {
    try {
      const response = await axios.get(`${APIURL}/author/`, {
        headers: {
          Authorization: getAuthorizationHeader(),
        },
      });
      const github = response.data.item.github;
      console.log('github: ', github);
      const path = github.split('/');
      const username = path[path.length - 1]; 
      setUsername(username);
      console.log('username: ', username);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };
  
    const fetchData = async () => {
      try {
        console.log('username*: ', username);
        if (username !== '') {
          const response = await axios.get(`https://api.github.com/users/${username}/events`);
          setData(response.data);
          console.log(response.data);
        }
      } catch (error: any) {
        if (error.response.status === 403) {
          setError('Github API rate limit exceeded\nPlease try again later');
        }
        console.error('Error fetching data:', error);
      }
    }
  
  
  return (
    <div className="container">
      <Leftbar  />
        <div className="activityList">
        {error ? (
          <h1 style={{whiteSpace: 'pre-line', alignSelf: 'center'}}>{error}</h1>
        ) : (
          data.map((activity) => <Activity key={activity.id} activity={activity} />)
        )}
        </div>
    </div>
      
      
  );
};

export default Github;
