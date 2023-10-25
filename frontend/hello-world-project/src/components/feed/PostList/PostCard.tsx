import React, {useState} from 'react';
import './postCard.css';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';

type PostData = {
    img: string;
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
    return (
        <div className="PostCard">
            <div className="postTop">
                <img src={data.user_img} alt="" className="postProfileImg" />
                <div className="postUsername">
                    <span >{data.name}</span>
                </div>
            </div>
            <img src={data.img} alt="" />
            <div className="reactions">
                {isliked ? <FavoriteIcon className='like' onClick={handleLike}/>: <FavoriteBorderIcon onClick={handleLike}/>}   
                <CommentIcon/>
                <SendIcon />
            </div>
            <span>{likes} likes</span>
        </div>
    );
};

export default PostCard;
