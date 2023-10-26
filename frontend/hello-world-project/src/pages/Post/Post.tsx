import React, {useState, useRef} from 'react'
import './post.css'
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import Leftbar from '../../components/leftbar/Leftbar';


export default function PostShare() {
    const [image, setImage] = useState<any | null>(null);
    const ImageRef = React.createRef<HTMLInputElement>()

    const onImageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if (event.target.files && event.target.files[0]) {
          let img: File = event.target.files[0];
          setImage({
            image: URL.createObjectURL(img),
          });
        }
      }

  return (
    <>
    <div className="shareContainer">
        <Leftbar/>
            <div className="postShare">
                <img src='/assets/person/5.jpg' alt='' />
                <div>
                    <textarea  placeholder="What's on your mind?" />
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
                        <button className="postButton">Friends Only Post</button>
                        <button className="postButton">Public Post</button>
                        <button className="postButton">Unlisted Post</button>
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
