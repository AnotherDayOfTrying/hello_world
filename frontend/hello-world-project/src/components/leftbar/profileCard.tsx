import React, {useState, useEffect} from 'react'
import './profileCard.css'
import axios from "axios"
import APIURL, { getAuthorizationHeader, getAuthorId} from "../../api/config"
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

interface ProfileCardProps { 
  Reload?: boolean;
}

export default function ProfileCard({Reload: isReload}: ProfileCardProps) {
  const [author, setAuthor] = useState<any>(null)
  const {enqueueSnackbar} = useSnackbar()
  const navigate = useNavigate()

  useEffect(() => {
    getAuthor()
  }, [isReload])

  const getAuthor = async () => {
    try {
      const response = await axios.get(`${APIURL}/authors/${getAuthorId()}`, {
        headers: {
          Authorization: getAuthorizationHeader()
        }
      })
      setAuthor(response.data)
    } catch (e) {
      enqueueSnackbar('Unable to fetch your details', {variant: "error", anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
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
        <img className='profile' src={author?.profilePicture} alt='' />
        <img className='background' src='/assets/post/4.jpg' alt='' />
        <EditIcon className='editIcon' style={{alignSelf: 'flex-end', marginTop: '10px', marginRight: '10px', cursor: 'pointer'}} onClick={handleEdit} />
      </div>
      <div className='profileName'>
        <span>{author?.displayName}</span>
        <span>{author?.github} </span>
      </div>
    </div>
  )
}