import React, {useState, useEffect} from 'react'
import './post.css'
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import Leftbar from '../../components/leftbar/Leftbar';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { ImageOutput, PostOutput, useCreatePost, useSendPost, useEditPost, useCreatePostImage, useDeletePostImage, CONTENT_TYPE } from '../../api/post';
import axios from 'axios';
import { AuthorOutput, getAllLocalAuthorsAsync } from '../../api/author';
import { useGetFriends } from '../../api/friend';
import { Button, Chip, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { enqueueSnackbar } from 'notistack';



export default function PostShare() {
    const { state } = useLocation();
    let data: {post: PostOutput} | undefined = undefined;
    if (state)
        data = state;
    const [title, setTitle] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [contentType, setContentType] = useState<CONTENT_TYPE>('text/plain')
    const [categories, setCategories] = useState<string[]>([])
    const [category, setCategory] = useState<string>('')
    const [image, setImage] = useState<any | null>(null);
    const [text, setText] = useState<string>('');
    const ImageRef = React.createRef<HTMLInputElement>()
    const {userInfo} = useAuth()
    const location = useLocation();

    const createPostHandler = useCreatePost()
    const editPostHandler = useEditPost(data?.post)
    const sendPostHandler = useSendPost()
    const friends = useGetFriends(userInfo)
    const createPostImageHandler = useCreatePostImage(data?.post)
    const deletePostImageHandler = useDeletePostImage(data?.post)

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

    const isImagePost = (contentType: string) => contentType === 'image/jpeg' || contentType === 'image/png' || contentType  === 'application/base64'

    const setData = async () => {
        if (data) {
            if (data.post.content) {
                setTitle(data.post.title)
                setDescription(data.post.description)
                setText(data.post.content)
                setContentType(data.post.contentType)
                setCategories(JSON.parse(data.post.categories || '[]'))
            }
            if (data.post.content && isImagePost(data.post.contentType)) {
                setImage(data.post.content)
            }
        }
    }


    const onImageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if (event.target.files && event.target.files[0]) {
          let img: File = event.target.files[0];
          setImage(URL.createObjectURL(img));
        }
      }

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setText(event.target.value); 
    };

    const handlePostSubmit = async (privacy: string)  => {
        // "text/plain" | "text/markdown" | "application/base64" | "image/png" | "image/jpeg"
        const isImagePost = contentType.toLowerCase() === 'image/png' || contentType.toLocaleLowerCase() === 'image/jpeg' || contentType.toLocaleLowerCase() === 'application/base64'

        if (ImageRef.current && ImageRef.current.files && ImageRef.current.files[0]) {
            setImage({
                data: ImageRef.current.files[0],
                ...image
            })
        } else {
            setImage(null)
        }

        let content: any = '';
        if (isImagePost) {
            if (ImageRef.current && ImageRef.current.files && ImageRef.current.files[0]) {
                let file = ImageRef.current.files[0];
                content = await new Promise((resolve) => {
                    let fileReader = new FileReader();
                    fileReader.onload = (e) => resolve(fileReader.result);
                    fileReader.readAsDataURL(file);
                });
            }
        } else {
            content = text
        }

        if (!content) {
            enqueueSnackbar('Error encoding content', {variant: 'error'})
            return
        }

        if (privacy === 'Edit' && data) {
            try {
                const response = await editPostHandler.mutateAsync({
                    post: data.post,
                    postInput: {
                        title: title,
                        author: userInfo,
                        description: description,
                        content: content,
                        contentType: contentType,
                        visibility: data.post.visibility,
                        unlisted: data.post.unlisted,
                        categories: JSON.stringify(categories),
                    }
                })

                return response;
            } catch (error: any) {
                console.log(error);
            };
        } else {
            try {
                const response = await createPostHandler.mutateAsync({author: userInfo, postInput: {
                    title: title,
                    author: userInfo,
                    description: description,
                    content: content,
                    contentType: contentType,
                    visibility: privacy === 'PUBLIC' ? 'PUBLIC' : 'FRIENDS',
                    unlisted: privacy === 'UNLISTED',
                    categories: JSON.stringify(categories),
                }})
                if (image && contentType.toLowerCase() === 'image')
                    await createPostImageHandler.mutateAsync({
                        post: response,
                        imageInput: {image: image.data || ''}
                    })
                const sendList: AuthorOutput[] = []
                if (privacy === 'PUBLIC') {
                   sendList.push(...(await getAllLocalAuthorsAsync())!.items)
                   // TODO: send to other apps
                } else if (privacy === 'PRIVATE') {
                    sendList.push(...(friends.data!.map((friendship) => {return friendship.actor})))
                } else if (privacy === 'UNLISTED') {
                    // send to self
                    sendList.push(userInfo)
                }
                const sendRequests = sendList.map(async (author) => {
                    sendPostHandler.mutate({
                        author: author,
                        sendPostInput: {
                            type: 'post',
                            author: userInfo,
                            id: response!.id,
                        }
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
                    <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
                    <TextField label="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
                    <div className="contentType">
                        <span>
                            <Chip label='Text' variant={contentType === 'text/plain' ? 'filled' : 'outlined'} color='primary' onClick={() => {setContentType('text/plain')}}/>
                        </span>
                        <span>
                            <Chip label='Markdown' variant={contentType === 'text/markdown' ? 'filled' : 'outlined'} color='secondary' onClick={() => {setContentType('text/markdown')}}/>
                        </span>
                        <span>
                            <Chip label='Image' variant={contentType === 'image/jpeg' || contentType === 'image/png' || contentType === 'application/base64' ? 'filled' : 'outlined'} color='error' onClick={() => {setContentType('image/png')}}/>
                        </span>
                    </div>
                    {
                        contentType.toLowerCase() === 'text/markdown' || contentType.toLocaleLowerCase() === 'text/plain' ?
                            <textarea placeholder="What's on your mind?" value={text} onChange={handleTextChange}/>
                        :
                            <div className="option" style={{color: "#ef5757"}} onClick={() => 
                                {
                                    if (ImageRef.current !== null){
                                        ImageRef.current.click()
                                    }
                                }}>
                                <ImageIcon/>
                                Photo
                            </div>  
                    }
                    <TextField label='Category' onChange={(event) => {
                            setCategory(event.target.value)
                        }} />
                    <button
                        className="postButton"
                        onClick={() => {
                            let categoriesCopy = categories.slice()
                            if (category && !!!categories.find((value) => value === category))
                                categoriesCopy.push(category)
                            setCategories(categoriesCopy)
                        }}>
                            Set Category
                        </button>
                    <Stack direction={'row'}>
                        {
                            categories.map((category) => {
                                return <Chip label={category} key={category} onDelete={(event) => {
                                    let categoriesCopy = categories.slice()
                                    setCategories(categoriesCopy.filter((value) => value !== category))
                                }} />
                            })
                        }
                    </Stack>
                    
                    <div className="postOptions">
                        <div className="option" style={{color: "#ef5757"}} onClick={() => 
                        {
                            if (ImageRef.current !== null){
                                ImageRef.current.click()
                            }
                        }}>
                            
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
                    {image && isImagePost(contentType) && (
                        <div className="imagePreview">
                            <ClearIcon onClick={() => setImage(null)}/>
                            <img src={image} alt="" />
                        </div>
                    )}
                </div>
            
            </div>
        </div>
    </>
    
    
  )
}