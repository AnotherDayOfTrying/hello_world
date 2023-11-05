import React, {useState, useRef} from 'react'
import './post.css'
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import Leftbar from '../../components/leftbar/Leftbar';
import axios, { AxiosError } from "axios";
import APIURL, { getAuthorizationHeader } from "../../api/config";


export default function PostShare() {
    const [image, setImage] = useState<any | null>(null);
    const ImageRef = React.createRef<HTMLInputElement>()
    const [text, setText] = useState<string>('');
    


    const onImageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if (event.target.files && event.target.files[0]) {
          let img: File = event.target.files[0];
          setImage({
            image: URL.createObjectURL(img),
          });
        }
      }

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setText(event.target.value); 
    };

    const handlePostSubmit = async (privacy: string)  => {
        const formData = new FormData();
        formData.append('title', 'Post Title');
        formData.append('content_type', 'TEXT');
        formData.append('privacy', privacy);
        formData.append('text', text);
        if (ImageRef.current && ImageRef.current.files) {
            formData.append('image_url', "https://images.unsplash.com/photo-1575936123452-b67c3203c357?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D");
            formData.append('image', ImageRef.current.files[0]);
            
        }

        try {
            const response = await axios.post(`${APIURL}/post/upload/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: getAuthorizationHeader(),
                }
            });
            const responseData: any = response.data;
            console.log('post upload response:', responseData);
            return responseData;
        } catch (error: any) {
            console.log(error);
        };      

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
                            onChange={onImageChange} />
                        </div>
                    </div>
                    {image && (
                        <div className="imagePreview">
                            <ClearIcon onClick={() => setImage(null)}/>
                            <img src={image.image} alt="" />
                        </div>
                    )}
                </div>
            
            </div>
        </div>
    </>
    
    
  )
}
