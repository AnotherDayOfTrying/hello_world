import React, { useState, useEffect } from 'react';
import './editProfile.css';
import Leftbar from '../../components/leftbar/Leftbar';
import { TextField, Typography } from '@mui/material';
import axios from 'axios';
import { APIURL, getAuthorizationHeader, getAuthorId} from '../../api/config';
import gsap from 'gsap';
import ClearIcon from '@mui/icons-material/Clear';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../providers/AuthProvider';



const EditProfile: React.FC = () => {
    const [displayName, setDisplayName] = useState<string>('');
    const [github, setGitHub] = useState<string>('');
    const [profilePicture, setProfilePicture] = useState<any>(undefined);
    const [previewImage, setPreviewImage] = useState<any>(undefined);
    const [id, setID] = useState<string>('');
    const [author, setAuthor] = useState<any>(null);
    const ImageRef = React.createRef<HTMLInputElement>()
    const [reload, setReload] = useState(false);
    const {enqueueSnackbar} = useSnackbar();
    const {refreshUser} = useAuth()

  const getAuthor = async () => {
    try {
      const response = await axios.get(`${APIURL}/authors/${getAuthorId()}/`, {
        headers: {
          Authorization: getAuthorizationHeader(),
        },
      });
      setDisplayName(response.data.displayName);
      setGitHub(response.data.github);
      setProfilePicture(response.data.profilePicture);
      setID(response.data.id)
      setAuthor(response.data);
    } catch (e) {
      console.error(e);
    }
  };
  
  useEffect(() => {  
    getAuthor();
    gsap.to('.EditProfileContainer', { opacity: 1 }); 
  }, []);

  // reload component when author is updated
    useEffect(() => {
        if (!author) {
        getAuthor();
        }
    }, [author]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = (event.target.files && event.target.files[0]) || undefined;

    if (file) {
      // Read the file content and create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePicture(undefined);
      setPreviewImage(undefined);
    }
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setReload(false);
    event.preventDefault();
    const formData = new FormData()
    if (displayName !== null){
        formData.append('displayName', displayName)
    }
    if (github !== null){
        formData.append('github', github)
    }

    if (ImageRef.current && ImageRef.current.files && ImageRef.current.files[0]) {
        formData.append('profilePictureImage', ImageRef.current.files[0])
    }
    try {
        const response = await axios.post(`${APIURL}/authors/${getAuthorId()}/`, formData,{
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: getAuthorizationHeader(),
          },
        });
        enqueueSnackbar('Your profile was updated successfully!', {variant: 'success', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        setDisplayName(response.data.displayName);
        setGitHub(response.data.github);
        setProfilePicture(response.data.profilePicture);
        setReload(true);
        handleClearPicture();
        await refreshUser()
      } catch (e) {
        console.error(e);
      }
  };

  const handleClearPicture = () => {
    setPreviewImage(undefined);
    const fileInput = document.getElementById('profilePicture') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
  }

  };

  return (
    <>
      <div className="EditProfileContainer" style={{ opacity: 0 }}>
        <Leftbar reload={reload}/>
        <div className="EditProfile">
            <h1 style={{marginBottom: '1rem'}}>Edit Profile Information</h1>
          <TextField
            id="displayName"
            label="Display Name"
            variant="standard"
            value={displayName}
            onChange={(event: any) => {
              setDisplayName(event.target.value);
            }}
          />
          <TextField
            id="github"
            label="GitHub Link"
            variant="standard"
            value={github}
            onChange={(event: any) => {
              setGitHub(event.target.value);
            }}
          />
          <Typography style={{ marginTop: '1em' }}>Profile Picture</Typography>
          <input
            id="profilePicture"
            onChange={handleFileChange}
            type="file"
            accept=".png,.jpeg,.jpg" 
            ref={ImageRef}
          />
          <Typography>Profile Picture Preview</Typography>
          {previewImage ? (
            <div className="previewContainer" >
                <div className="preview">
                    <img className="profilePicture" src={previewImage} alt="Preview" />
                </div>
                <ClearIcon style={{alignSelf: 'auto'}} onClick={handleClearPicture}/>
            </div>
          ) : profilePicture && (
                <img
                className="profilePicture"
                src={profilePicture}
                /> 
          ) }
          <button 
                style={{alignSelf: 'flex-start', height: '2rem', paddingLeft: '20px', paddingRight: '20px'}} 
                className="EditProfileButton"
                onClick={handleSubmit}>
                Submit
            </button>
        </div>
      </div>
    </>
  );
}

export default EditProfile;
