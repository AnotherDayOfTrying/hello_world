import React, {useState} from 'react';
import './postCard.css';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import ReactMarkdown from 'react-markdown';
import { PostData } from './data/postsData';
import FriendCard from '../../../pages/Friends/FriendCard';

type PostData = {
    img: string;
    description: string;
    name: string;
    user_img: string;
    likes: number;
    liked: boolean;
};
  
type PostCardProps = {
    data: PostData;
    
};
  
const PostCard = ({ data}: PostCardProps) => {
    const [likes, setLikes] = React.useState(data.likes);
    const [isliked, setIsLiked] = React.useState(data.liked);

    const handleLike = () => {
        setLikes(isliked ? likes -1 : likes + 1);
        setIsLiked(!isliked);
    };
    const PopupContent: React.FC = () => (
        <div className='popupContainer'>
            {PostData.map((friend: any, id: number) => (
                <FriendCard key={id} data={friend} shareList />
            ))}
        </div>
    );
        
    
    const handleSend = () => {
        alert('Message Sent');
        
    };

    return (
        <div className="PostCard">
            <div className="postTop">
                <img src={data.user_img} alt="" className="postProfileImg" />
                <div className="postUsername">
                    <span >{data.name}</span>
                </div>
            </div>
            {/* check if there is description and if so render it as markdown */}
            {data.description && <ReactMarkdown className="postText" children={data.description} />}

            {data.img && <img src={data.img} alt="" />}
            <div className="reactions">
                {isliked ? <FavoriteIcon className='like' onClick={handleLike}/>: <FavoriteBorderIcon onClick={handleLike}/>}   
                <CommentIcon/>
                <Popup trigger={<SendIcon> Send</SendIcon>} position="right center">
                    <PopupContent />
                </Popup>
            </div>
            <span>{likes} likes</span>
        </div>
    );
};

export default PostCard;
