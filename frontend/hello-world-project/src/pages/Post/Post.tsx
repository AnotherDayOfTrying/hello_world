import React, {useState, useEffect} from 'react'
import './post.css'
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import Leftbar from '../../components/leftbar/Leftbar';
import axios, { AxiosError } from "axios";
import APIURL, { getAuthorizationHeader } from "../../api/config";
import { useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { AuthorOutput, getAuthorAsync } from '../../api/author';
import { useAuth } from '../../providers/AuthProvider';
import { createPostAsync, sendPostAsync } from '../../api/post';



export default function PostShare() {
    const [image, setImage] = useState<any | null>(null);
    const ImageRef = React.createRef<HTMLInputElement>()
    const [text, setText] = useState<string>('');
    const [author, setAuthor] = useState<AuthorOutput>();
    const { state } = useLocation();
    const {enqueueSnackbar} = useSnackbar()
    const {userId} = useAuth()
    const data = state as any;

    const location = useLocation();

    useEffect(() => {
      // Fetch or update data based on the route change
      console.log(location.pathname);
      if (location.pathname === '/post') {
        setText('');
        setImage(null);
    } else{
        setData();  
    }}, [location.pathname]);

    useEffect(() => {
        setData();
    }
    , [data]);

    const setData = async () => {
        if (data) {
            if (data.data.text !== '') {
                setText(data.data.text);
            }
            if (data.data.image !== null) {
                console.log('image:', data.data.image);
                setImage({
                    image: `${APIURL}${data.data.image}`,
                });
            }
        }
        setAuthor(await getAuthorAsync(userId))
    } 


    const onImageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if (event.target.files && event.target.files[0]) {
          let img: File = event.target.files[0];
            console.log('img:', img);
            console.log('imgFile:', URL.createObjectURL(img));
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
        formData.append('text', text);

        if (ImageRef.current && ImageRef.current.files && ImageRef.current.files[0]) {
            console.log("got in")
            console.log(ImageRef.current.files);
            formData.append('image', ImageRef.current.files[0]);
            formData.append('image_url', "https://images.unsplash.com/photo-1575936123452-b67c3203c357?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D");
        } else if (image && image.image) {
            // If image is not provided through the file input but exists in the state
            // Fetch the image from the URL and convert it to a file
            formData.append('image_url', "https://images.unsplash.com/photo-1575936123452-b67c3203c357?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D");
            const response = await axios.get(`${image.image}`, {
                responseType: 'blob'
            });
            const blob = await response.data;
            const file = new File([blob], "image.jpg", {type: "image/jpeg"});
            formData.append('image', file);
            console.log('file:', file);
        } else {
            formData.append('image_url', "https://images.unsplash.com/photo-1575936123452-b67c3203c357?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D");
            formData.append('image', '');
        }

        if (privacy === 'Edit') {
            formData.append('privacy', data.data.privacy);
            try {
                // await createPostAsync(userId, {
                //     title: '',
                //     author: author!,
                //     description: '',
                //     content: '',
                //     contentType: 'text/plain',
                //     visibility: 'PUBLIC',
                //     unlisted: false,
                //     categories: '',
                // });
                const response = await axios.post(`${APIURL}/post/edit/${data.data.id}/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: getAuthorizationHeader(),
                    }
                });
                const responseData: any = response.data;
                console.log('post Edit response:', responseData);
                enqueueSnackbar('Post Edited Successfully', {variant: 'success'});
                return responseData;
            } catch (error: any) {
                console.log(error);
            };      
    
        } else{
            formData.append('privacy', privacy);
            try {
                const response = await createPostAsync(userId, {
                    title: 'Post Title',
                    author: author!,
                    description: text,
                    content: text,
                    contentType: 'text/plain',
                    visibility: privacy == 'PUBLIC' ? 'PUBLIC' : 'FRIENDS',
                    unlisted: privacy == 'UNLISTED',
                    categories: '',
                });
                await sendPostAsync(userId, {
                    type: 'post',
                    author: author!,
                    object: response!.id,
                })
                return response;
            } catch (error: any) {
                console.log(error);
            };      
    
        }
    };

  return (
    <>
    <div className="shareContainer">
        <Leftbar/>
            <div className="postShare">
                <img src={`${author?.profilePicture || ''}`} alt='' />
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
                        {data? (
                            <button className="postButton" onClick={() => handlePostSubmit('Edit')}>Edit Post</button>
                            ):(
                            <>
                                <button className="postButton" onClick={() => handlePostSubmit('PRIVATE')}>Friends Only Post</button>
                                <button className="postButton" onClick={() => handlePostSubmit('PUBLIC')}>Public Post</button>
                                <button className="postButton" onClick={() => handlePostSubmit('UNLISTED')}>Unlisted Post</button>
                            </>
                        )}
                        <div style={{display: "none"}}>
                            <input 
                                type="file" 
                                name="imagePost" 
                                accept=".png,.jpeg,.jpg" 
                                ref={ImageRef} 
                                onChange={onImageChange} 
                                />
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