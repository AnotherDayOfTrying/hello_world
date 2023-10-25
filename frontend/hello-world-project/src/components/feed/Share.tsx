import React, {useState, useRef} from 'react'
import './share.css'
import ReactMarkdown from 'react-markdown'
import ImageIcon from '@mui/icons-material/Image';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import LinkIcon from '@mui/icons-material/Link';
import ClearIcon from '@mui/icons-material/Clear';

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
    <div className="postShare">
        <img src='/assets/person/5.jpg' alt='' />
        <div>
            <input type='text' placeholder="What's on your mind?" />
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
                <div className="option" style={{color: "#4A4EB7"}}>
                    <TextFieldsIcon/>
                    Common Mark
                </div>
                <div className="option" style={{color: "#4CB256"}}>
                    <LinkIcon/>
                    Image Link
                </div>
                <button className="postButton">Post</button>
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
    
  )
}
