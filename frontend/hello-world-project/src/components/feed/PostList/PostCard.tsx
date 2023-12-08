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
import { ImageOutput, PostOutput, useDeletePost, useGetLikeObjects, useGetPostImage } from '../../../api/post';
import { getAuthorAsync } from '../../../api/author';
import { LikeListOutput, useLikeObject } from '../../../api/like';
import { FriendshipOutput } from '../../../api/friend';
import { PAGE_TYPE } from '../../../App';
import { useAuth } from '../../../providers/AuthProvider';


type PostCardProps = {
    data: PostOutput;
    liked: LikeListOutput;
    type: PAGE_TYPE;
    friends: FriendshipOutput[],
};


const PostCard = ({ data, type, liked, friends }: PostCardProps) => {
    const {userInfo} = useAuth();
    const [isliked, setIsLiked] = React.useState(false);
    const [openComments, setOpenComments] = useState<boolean>(false);
    const [openSendFriends, setOpenSendFriends] = useState<boolean>(false);
    const [openLikes, setOpenLikes] = useState<boolean>(false);
    const commentButton = useRef<any>(null);
    const sendButton = useRef<any>(null);
    const likes = useRef<any>(null);
    const handleDelete = useDeletePost();
    const navigate = useNavigate();
    const likeObjectHandler = useLikeObject()
    const likeAuthors = useGetLikeObjects(data)
    const image = useGetPostImage(data)
    

    useEffect(() => {
        const isLiked = !!liked.items.find((likedPost)=> likedPost.object === data.id);
        setIsLiked(isLiked);
      }, [liked]);

    const handleLike = async () => {
        if (isliked) {
            setIsLiked(!isliked);
            //unlike
        } else {
            setIsLiked(!isliked);
            try {
                const response = await likeObjectHandler.mutateAsync({
                    author: data.author,
                    likeInput: {
                        type: 'Like',
                        author: userInfo,
                        object: data.id
                    }
                })
                setIsLiked(true);
                return response;
            } catch (error: any) {
                console.log(error);
            };
        }
    }

    const renderDescription = (description: string) => {
        if (description.includes('data:image/')) {
            return (<></>)
        }
        
        if (linkify.test(description)) {
            return (
            <Typography>
                <Linkify>{description}</Linkify> 
            </Typography>
            );
        } else {
            return (
            <Typography>
                <div>
                    <ReactMarkdown>{description}</ReactMarkdown>
                </div>
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
                {likeAuthors ? likeAuthors.data!.map((friend: any) => {
                    friend = {
                        ...friend,
                        actor: friend.author
                    }
                    return <FriendCard data={friend} post={data} shareList/>
                }) : <></>}
            </div>
        )
    };

    const handleEdit = () => {
        navigate('/post/edit', { state: { post: data, image: image.data } });
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
            {image && <img src={`${image.data?.image_url || image.data}`} alt="" className='postImage'/>}
            <div className="reactions">
                <div className="likes">
                    {isliked ? <FavoriteIcon className='like' onClick={handleLike}/>: <FavoriteBorderIcon onClick={handleLike}/>} 
                    {type === PAGE_TYPE.MY_POST ? <div ref={likes} onClick = {() => {setOpenLikes(!openLikes)}}>likes</div> : <></>}
                </div> 
                <CommentIcon onClick = {()=> {setOpenComments(!openComments)}} ref={commentButton}/>
                <SendIcon onClick = {() => {setOpenSendFriends(!openSendFriends)}} ref={sendButton}/>
                <Popover open={openComments} anchorEl={commentButton.current} onClose={() => {setOpenComments(false)}} anchorOrigin={{vertical: 'bottom', horizontal: 'left',}}>
                    <Comment data={data} liked={liked}/>
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
