import React, {useState, useEffect} from 'react'
import './profileCard.css'
import axios from "axios"
import { APIURL, getAuthorizationHeader, getAuthorId} from "../../api/config"
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../providers/AuthProvider';

interface ProfileCardProps { 
  Reload?: boolean;
}

export default function ProfileCard({Reload: isReload}: ProfileCardProps) {
  const {userInfo} = useAuth()
  const navigate = useNavigate()

  const handleEdit = () => {
    navigate('/editprofile')
  }

  return (
    <div className='profileCard'>
      <div className='profileImages'>
        <img className='profile' src={userInfo.profileImage} alt='' />
        <img className='background' src='/assets/post/4.jpg' alt='' />
        <EditIcon className='editIcon' style={{alignSelf: 'flex-end', marginTop: '10px', marginRight: '10px', cursor: 'pointer'}} onClick={handleEdit} />
      </div>
      <div className='profileName'>
        <span>{userInfo.displayName}</span>
        <span>{userInfo.github} </span>
      </div>
    </div>
  )
}