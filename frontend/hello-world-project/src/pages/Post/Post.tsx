import React, {useState, useRef} from 'react'
import './post.css'
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import Leftbar from '../../components/leftbar/Leftbar';
import axios, { AxiosError } from "axios";
import APIURL, { getAuthorizationHeader } from "../../api/config";
import Popup from 'reactjs-popup';
import { Alert } from '@mui/material';


export default function PostShare() {
    const [images, setImages] = useState<any[]>([]);
    const ImageRef = React.createRef<HTMLInputElement>()
    const [text, setText] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    


    const onImageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if (event.target.files) {
            const newImages: Array<any> = [];
            for (let i = 0; i < event.target.files.length; i++) {
                const img: File = event.target.files[i];
                newImages.push({
                    id: i,
                    image: URL.createObjectURL(img),
                    imageFile: img,
                });
            }
            setImages(newImages);
        }}

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setText(event.target.value); 
    };

    const handlePostSubmit = async (privacy: string)  => {
        const formData = new FormData();
        formData.append('title', 'Post Title');
        formData.append('content_type', 'TEXT');
        formData.append('privacy', privacy);
        formData.append('text', text);
        const postImages = images.map((image) => image.imageFile);
        postImages.forEach((image) => formData.append('images', image));
        console.log('Form Data:', formData);

        try {
            const response = await axios.post(`${APIURL}/post/upload/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: getAuthorizationHeader(),
                }
            });
            const responseData: any = response.data;
            showPopUp();
            console.log('post upload response:', responseData);
            return responseData;
        } catch (error: any) {
            console.log(error);
        };      

    };
    const showPopUp = () => {
        setImages([]);
        setText('');
        setOpen(true);
        console.log('Open:', open);
        // Close the popup after 3 seconds (3000 milliseconds)
        setTimeout(() => {
        setOpen(false);
      }, 3000);
      }
    
    const removeImage = (id: number) => {
        const updatedImages = images.filter((img) => img.id !== id);
        setImages(updatedImages);
    };

  return (
    <>
    <div className="shareContainer">
        <Leftbar/>
            <div className="postShare">
                <img src='/assets/person/5.jpg' alt='' />
                <div>
                    <textarea  placeholder="What's on your mind?" value={text} onChange={handleTextChange}/>
                    <div className="postOptions">
                        <div className="option" style={{color: "#ef5757"}} onClick={() => 
                        {
                            if (ImageRef.current !== null){
                                ImageRef.current.click()
                            }
                        }}>
                            <ImageIcon/>
                            Photo
                        </div>
                        <button className="postButton" onClick={() => handlePostSubmit('PRIVATE')}>Friends Only Post</button>
                        <button className="postButton" onClick={() => handlePostSubmit('PUBLIC')}>Public Post</button>
                        <button className="postButton" onClick={() => handlePostSubmit('UNLISTED')}>Unlisted Post</button>
                        <div style={{display: "none"}}>
                            <input 
                            type="file" 
                            name="imagePost" 
                            accept=".png,.jpeg,.jpg" 
                            ref={ImageRef} 
                            onChange={onImageChange}
                            multiple />
                        </div>
                    </div>
                    {images.length > 0 && (
                        <div className="images">
                            {images.map((img) => (
                                <div key={img.id} className="imagePreview">
                                    <ClearIcon onClick={() => removeImage(img.id)} />
                                    <img src={img.image} alt="" />
                                </div>
                            ))}
                        </div>
                    )}
                    <Popup  open={open} contentStyle={{width: "50%"}}  >
                        <Alert severity={"success"}>Post created successfully!</Alert>
                    </Popup>
                </div>
            
            </div>
        </div>
    </>
    
    
  )
}
