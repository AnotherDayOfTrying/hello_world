import React, {useState, useEffect} from 'react'
import './profileCard.css'
import axios from "axios"
import APIURL, { getAuthorizationHeader} from "../../api/config"
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';


export default function ProfileCard() {
  const [author, setAuthor] = useState<any>(null)
  const navigate = useNavigate()

  const getAuthor = async () => {
    try {
      const response = await axios.get(`${APIURL}/author/`, {
        headers: {
          Authorization: getAuthorizationHeader()
        }
      })
      setAuthor(response.data.item)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    getAuthor()
  }, [])

  const handleEdit = () => {
    navigate('/editprofile')
  }

  return (
    <div className='profileCard'>
      <div className='profileImages'>
        <img className='profile' src={APIURL + author.profilePicture} alt='' />
        <img className='background' src='/assets/post/4.jpg' alt='' />
        <EditIcon className='editIcon' style={{alignSelf: 'flex-end', marginTop: '10px', marginRight: '10px'}} onClick={handleEdit} />
      </div>
      <div className='profileName'>
        <span>{author?.displayName}</span>
        <span>{author?.github} </span>
      </div>
    </div>
  )
}