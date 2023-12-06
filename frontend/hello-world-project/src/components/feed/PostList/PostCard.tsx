import React, {useState, useEffect, useRef} from 'react';
import './postCard.css';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import 'reactjs-popup/dist/index.css';
import ReactMarkdown from 'react-markdown';
import FriendCard from '../../../pages/Friends/FriendCard';
import { Alert } from '@mui/material';
import * as linkify  from 'linkifyjs';
import Linkify from 'react-linkify';
import Comment from './Comment';
import Popup from 'reactjs-popup';
import axios from "axios"
import APIURL, { getAuthorizationHeader } from "../../../api/config"
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, Navigate } from 'react-router-dom';
import { Popover } from '@mui/material';
import { ImageOutput, PostOutput, deletePostAsync, getPostImageAsync } from '../../../api/post';
import { getAuthorAsync } from '../../../api/author';
import { useAuth } from '../../../providers/AuthProvider';
import { likeObjectAsync } from '../../../api/like';


type PostCardProps = {
    data: PostOutput;
    isLiked: boolean;
    likeid?: number;
    myposts?: boolean;
    Reload: () => void;
};


const PostCard = ({ data, myposts: isMyPosts, Reload, isLiked, likeid }: PostCardProps) => {
    const [isliked, setIsLiked] = React.useState(isLiked);
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [friendsList, setFriendsList] = useState<any[]>([]);
    const [userInfo, setUserInfo] = useState<any>({});
    const [image, setImage] = useState<ImageOutput>()
    const [openComments, setOpenComments] = useState<boolean>(false);
    const [openSendFriends, setOpenSendFriends] = useState<boolean>(false);
    const commentButton = useRef<any>(null);
    const sendButton = useRef<any>(null);
    const navigate = useNavigate();
    const {userId} = useAuth();
    useEffect(() => {
        setIsLiked(isLiked);
      }, [isLiked]);

    const handleShare = () => {
        // send api post req
        setIsAlertVisible(true);
    };

    const handleLike = async () => {
        if (isliked) {
            setIsLiked(!isliked);
        //     try {
        //     const response = await axios.delete(`${APIURL}/unlike/${likeId}/`,
        //     {
        //     headers: {
        //         'Content-Type': 'application/json',
        //         Authorization: getAuthorizationHeader(),
        //     }
        //     });
        //     const responseData: any = response.data;
        //     console.log('unlike response: ', responseData);
        //     setIsLiked(false);
        //     return responseData;
        // } catch (error: any) {
        //     console.log(error);
            
        // };
            
        } else {
            setIsLiked(!isliked);
            try {
            const response = await likeObjectAsync(data.author.id, {
                type: 'Like',
                author: userInfo,
                object: data.id
            })
            setIsLiked(true);
            return response;
        } catch (error: any) {
            console.log(error);
        };
        }
    };

    const fetchUserInfo = async () => {
        setUserInfo(await getAuthorAsync(data.author.id));
    }
    const fetchImageData = async () => {
        setImage(await getPostImageAsync(data.id))
    }

    useEffect(() => {
        fetchUserInfo()
        getFriendList()
        fetchImageData()
    }, [data]);

    const renderDescription = (description: string) => {
        if (linkify.test(description)) {
            return (
            <div style={{fontSize : 17, wordWrap: 'break-word'}}>
                <Linkify >{description}</Linkify> 
            </div>
            );
        } else {
            return (
            <div style={{fontSize : 2}}>
                <ReactMarkdown>{description}</ReactMarkdown>
            </div>
            );
        }
        };
    
    useEffect(() => {
        if (isAlertVisible) {
            const timer = setTimeout(() => {
                setIsAlertVisible(false);
            }, 1000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [isAlertVisible]);

    const getFriendList = async () => {
        try {
            let response = {data: []}
            if (!data.author.id) {
                response = await axios.get(`${APIURL}/authors/friends/`, {
                    headers: {
                    "Content-Type": "application/json",
                    Authorization: getAuthorizationHeader(),
                    },
                });
            }
            const friends: any[] = response.data;
            const authorFriends: any[] = []
            await Promise.all(
                friends.map(async (request) => {
                    try {
                        const authorResponse = await axios.get(`${APIURL}/authors/${request.sender}`, {headers: {Authorization: getAuthorizationHeader(),}});
                        const authorData = {
                            sender: authorResponse.data,
                        };
                        authorFriends.push(authorData); 
                    } catch (error) {
                        console.log("Error fetching author data:", error);
                    }
                })
            );
            setFriendsList(authorFriends)
            console.log('Friends:', authorFriends);
    
          } catch (error) {
            console.log(error);
          }
    }

    useEffect(() => {
        getFriendList()
    }, [])

    const PopupContent: React.FC = () => {
        if (isAlertVisible) {
            return(
            <Alert severity="success">Your message was sent successfully!</Alert>)
        }
        else{
            return(
                <div className='popupContainer'>
                    {friendsList.map((friend: any, id: number) => (
                    <FriendCard key={id} data={friend} shareList onClick={handleShare}
                    />))}
                </div>
            )
        }
        
    };

    const handleDelete = async () => {
        try {
            await deletePostAsync(data.id)
            Reload();
        } catch (error: any) {
            console.log(error);
        };
    }

    const handleEdit = () => {
        navigate('/post/edit', { state: { post: data, image: image } });
    }
    return (
        <div className="PostCard">
            <div className="postTop">
                <img src={`${userInfo.profilePicture}`} alt="" className="postProfileImg" />
                <div className="postUsername">
                    <span >{data.author.id ? data.author.displayName : userInfo.displayName}</span>
                </div>
                {isMyPosts && 
                <div className="postOptions"> 
                    <DeleteIcon style={{color: "#ff6b6b", cursor: 'pointer'}} onClick={handleDelete}/>
                    <EditIcon style={{color: "#ff6b6b", cursor: 'pointer'}} onClick={handleEdit}>
                    </EditIcon>
                </div>}
            </div>
            {data.content && renderDescription(data.content)}
            {image && <img src={`${image.image_url}`} alt="image" className='postImage'/>}
            <div className="reactions">
                {isliked ? <FavoriteIcon className='like' onClick={handleLike}/>: <FavoriteBorderIcon onClick={handleLike}/>}  
                <CommentIcon onClick = {()=> {setOpenComments(!openComments)}} ref={commentButton}/>
                <SendIcon onClick = {() => {setOpenSendFriends(!openSendFriends)}} ref={sendButton}/>
                <Popover open={openComments} anchorEl={commentButton.current} onClose={() => {setOpenComments(false)}} anchorOrigin={{vertical: 'bottom', horizontal: 'left',}}>
                    <Comment data={data} Reload={Reload}/>
                </Popover> 
                <Popover open={openSendFriends} anchorEl={sendButton.current} onClose={() => {setOpenSendFriends(false)}} anchorOrigin={{vertical: 'bottom',horizontal: 'left',}}>
                    <PopupContent />
                </Popover>
            </div>
        </div>
    );
};

export default PostCard;
