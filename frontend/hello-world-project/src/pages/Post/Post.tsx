import React, {useState, useRef} from 'react'
import './post.css'
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import Leftbar from '../../components/leftbar/Leftbar';
import axios, { AxiosError } from "axios";
import APIURL from "../../api/config";


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
        // const postData = {
        //     title: "Post Title",
        //     content_type: 'TEXT',
        //     privacy: privacy,
        //     text: text,
        //     image_url: image.image,
        //     image: ImageRef.current?.files ? ImageRef.current.files[0] : null,
        // }
        
        // try {
        //     const response = await axios.post(`${APIURL}/post/upload/`, postData
        //     ,
        //     {
        //       headers: {
        //         'Content-Type': 'application/json',
        //       }
        //     });
        //     const responseData: any = response.data;
        //     console.log('post upload response:', responseData);
        //     return responseData;
        //   } catch (error: any) {
        //     console.log(error);
        //   };
            

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
