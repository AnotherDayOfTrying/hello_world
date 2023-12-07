import React, {useState, useEffect, useRef} from 'react';
import './postCard.css';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import 'reactjs-popup/dist/index.css';
import ReactMarkdown from 'react-markdown';
import FriendCard from '../../../pages/Friends/FriendCard';
import * as linkify  from 'linkifyjs';
import Linkify from 'react-linkify';
import Comment from './Comment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, Navigate } from 'react-router-dom';
import { CircularProgress, Popover, Typography } from '@mui/material';
import { ImageOutput, PostOutput, getPostImageAsync, likeObjectsAsync, useDeletePost } from '../../../api/post';
import { getAuthorAsync } from '../../../api/author';
import { likeObjectAsync } from '../../../api/like';
import { FriendshipOutput } from '../../../api/friend';
import { PAGE_TYPE } from '../../../App';


type PostCardProps = {
    data: PostOutput;
    isLiked: boolean;
    type: PAGE_TYPE;
    friends: FriendshipOutput[],
};


const PostCard = ({ data, type, isLiked, friends }: PostCardProps) => {
    const [isliked, setIsLiked] = React.useState(isLiked);
    const [userInfo, setUserInfo] = useState<any>({});
    const [image, setImage] = useState<ImageOutput>()
    const [openComments, setOpenComments] = useState<boolean>(false);
    const [openSendFriends, setOpenSendFriends] = useState<boolean>(false);
    const [openLikes, setOpenLikes] = useState<boolean>(false);
    const [likeAuthors, setLikeAuthors] = useState<any>(null);
    const commentButton = useRef<any>(null);
    const sendButton = useRef<any>(null);
    const likes = useRef<any>(null);
    const handleDelete = useDeletePost();
    const navigate = useNavigate();

    useEffect(() => {
        setIsLiked(isLiked);
      }, [isLiked]);

    const handleLike = async () => {
        if (isliked) {
            setIsLiked(!isliked);
            //unlike
        } else {
            setIsLiked(!isliked);
            try {
            const response = await likeObjectAsync(data.author, {
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
        setUserInfo(await getAuthorAsync(data.author));
    }
    const fetchImageData = async () => {
        setImage(await getPostImageAsync(data))
    }
    const fetchLikes = async () => {
        setLikeAuthors(await likeObjectsAsync(data)) 
    }

    useEffect(() => {
        fetchUserInfo()
        fetchImageData()
        fetchLikes()
    }, [data]);

    const renderDescription = (description: string) => {
        if (description.includes('data:image/')) {
            return (<></>)
        }
        
        if (linkify.test(description)) {
            return (
            <Typography>
                <Linkify >{description}</Linkify> 
            </Typography>
            );
        } else {
            return (
            <Typography>
                <ReactMarkdown>{description}</ReactMarkdown>
            </Typography>
            );
        }
        };

    const PopupContent: React.FC = () => {
        return(
            <div className='popupContainer'>
                {friends ? friends
                .filter((friend) => friend.actor.id !== userInfo?.id)
                .map((friend) => (<FriendCard data={friend} post={data} shareList/>))
                :
                <></>}
            </div>
        )
    };

    const PopupLikes: React.FC = () => {
        return(
            <div className='popupContainer'>
                {likeAuthors ? likeAuthors.map((friend: any) => (
                <FriendCard data={friend} post={data} shareList/>
                )) : <></>}
            </div>
        )
    };

    const handleEdit = () => {
        navigate('/post/edit', { state: { post: data, image: image } });
    }

    if (handleDelete.isSuccess) {
        return <></>
    }

    return (
        <div className="PostCard">
            <div className="postTop">
                <img src={`${data.author.profileImage}`} alt="" className="postProfileImg" />
                <div className="postUsername">
                    <span >{data.author.id ? data.author.displayName : userInfo?.displayName}</span>
                </div>
                {type === PAGE_TYPE.MY_POST && 
                <div className="postOptions"> 
                    {handleDelete.isPending ?
                        <CircularProgress/>
                    :
                        <DeleteIcon style={{color: "#ff6b6b", cursor: 'pointer'}} onClick={() => handleDelete.mutateAsync(data.id)}/>
                    }
                    <EditIcon style={{color: "#ff6b6b", cursor: 'pointer'}} onClick={handleEdit}>
                    </EditIcon>
                </div>}
            </div>
            {data.content && renderDescription(data.content)}
            {image && <img src={`${image.image_url || image}`} alt="" className='postImage'/>}
            <div className="reactions">
                <div className="likes">
                    {isliked ? <FavoriteIcon className='like' onClick={handleLike}/>: <FavoriteBorderIcon onClick={handleLike}/>} 
                    {data.visibility === 'FRIENDS'? <div ref={likes} onClick = {() => {setOpenLikes(!openLikes)}}>likes</div>: <></>}
                </div> 
                <CommentIcon onClick = {()=> {setOpenComments(!openComments)}} ref={commentButton}/>
                <SendIcon onClick = {() => {setOpenSendFriends(!openSendFriends)}} ref={sendButton}/>
                <Popover open={openComments} anchorEl={commentButton.current} onClose={() => {setOpenComments(false)}} anchorOrigin={{vertical: 'bottom', horizontal: 'left',}}>
                    <Comment Reload={() => {}} data={data}/>
                </Popover> 
                <Popover open={openSendFriends} anchorEl={sendButton.current} onClose={() => {setOpenSendFriends(false)}} anchorOrigin={{vertical: 'bottom',horizontal: 'left',}}>
                    <PopupContent />
                </Popover>
                <Popover open={openLikes} anchorEl={likes.current} onClose={() => {setOpenLikes(false)}} anchorOrigin={{vertical: 'bottom',horizontal: 'left',}}>
                    <PopupLikes />
                </Popover>
            </div>
        </div>
    );
};

export default PostCard;
