import React from 'react'
import './editProfile.css'
import Leftbar from '../../components/leftbar/Leftbar'; 
import { TextField } from "@mui/material"


function EditProfile() {
    const [userName, setUserName] = React.useState<string>('')
    const [displayName, setDisplayName] = React.useState<string>('')
    const [github, setGitHub] = React.useState<string>('')
    const [profilePicture, setProfilePicture] = React.useState<string>('')

    const handleSubmit = () => {
        console.log(userName, displayName, github, profilePicture)
    }
  return (
    <>
        <div className='EditProfileContainer'>
            <Leftbar/>
            <div className="EditProfile">
            <TextField
                id="username"
                label="username"
                variant="standard"
                onChange={(event) => {setUserName(event.target.value)}}
                />
            <TextField
                id="displayName"
                label="Display Name"
                variant="standard"
                onChange={(event) => {setDisplayName(event.target.value)}}
                />
            <TextField
                id="github"
                label="GitHub Link"
                variant="standard"
                onChange={(event) => {setGitHub(event.target.value)}}
                />
            <button className="EditProfileButton" onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    </>
  )
}

export default EditProfile
