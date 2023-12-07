import React, {useState, useEffect} from 'react'
import './post.css'
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import Leftbar from '../../components/leftbar/Leftbar';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { ImageOutput, PostOutput, useCreatePost, createPostImageAsync, deletePostImageAsync, editPostAsync, sendPostAsync } from '../../api/post';
import axios from 'axios';
import { AuthorOutput, getAllLocalAuthorsAsync } from '../../api/author';
// import { getFriendsAsync } from '../../api/friend';



export default function PostShare() {
    const [image, setImage] = useState<any | null>(null);
    const ImageRef = React.createRef<HTMLInputElement>()
    const [text, setText] = useState<string>('');
    const { state } = useLocation();
    const {userInfo} = useAuth()
    let data: {post: PostOutput, image: ImageOutput} | undefined = undefined;
    if (state)
        data = state;
    const location = useLocation();
    const createPostHandler = useCreatePost()

    useEffect(() => {
      // Fetch or update data based on the route change
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
            if (data.post.content) {
                setText(data.post.content);
            }
            if (data.image && data.image.image_url) {
                const response = await axios.get(`${data.image.image_url}`, {
                    responseType: 'blob'
                });
                const blob = await response.data;
                const file = new File([blob], "image.jpg", {type: "image/jpeg"});
                setImage({image: data.image.image_url, data: file})
            }
        }
    } 


    const onImageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if (event.target.files && event.target.files[0]) {
          let img: File = event.target.files[0];
          setImage({
            image: URL.createObjectURL(img),
            data: img
          });
        }
      }

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setText(event.target.value); 
    };

    const handlePostSubmit = async (privacy: string)  => {

        if (ImageRef.current && ImageRef.current.files && ImageRef.current.files[0]) {
            setImage({
                data: ImageRef.current.files[0],
                ...image
            })
        } else {
            setImage(null)
        }

        if (privacy === 'Edit' && data) {
            try {
                const response = editPostAsync(data.post.id, {
                    title: 'Post Title',
                    author: userInfo,
                    description: text,
                    content: text,
                    contentType: 'text/plain',
                    visibility: data.post.visibility,
                    unlisted: data.post.unlisted,
                    categories: '',
                })
                if (image) {
                    await createPostImageAsync(data.post.id, {image: image.data || ''})
                } else if (data.image) {
                    await deletePostImageAsync(data.post.id)
                }
                return response;
            } catch (error: any) {
                console.log(error);
            };
        } else {
            try {
                const response = await createPostHandler.mutateAsync({author: userInfo, postInput: {
                    title: 'Post Title',
                    author: userInfo,
                    description: text,
                    content: text,
                    contentType: 'text/plain',
                    visibility: privacy === 'PUBLIC' ? 'PUBLIC' : 'FRIENDS',
                    unlisted: privacy === 'UNLISTED',
                    categories: '',
                }})
                if (image)
                    await createPostImageAsync(response!.id!, {image: image.data || ''})
                const sendList: AuthorOutput[] = []
                if (privacy === 'PUBLIC') {
                   sendList.push(...(await getAllLocalAuthorsAsync())!.items)
                   // TODO: send to other apps
                } else if (privacy === 'PRIVATE') {
                    // sendList.push(...(await getFriendsAsync(userInfo.id))!.map((friendship) => {return friendship.actor}))
                } else if (privacy === 'UNLISTED') {
                    // send to self
                    sendList.push(userInfo)
                }
                const sendRequests = sendList.map(async (author) => {
                    await sendPostAsync(author.id, {
                        type: 'post',
                        author: userInfo,
                        id: response!.id,
                    })
                })
                await Promise.all(sendRequests)
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
                <img src={`${userInfo.profileImage || ''}`} alt='' />
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