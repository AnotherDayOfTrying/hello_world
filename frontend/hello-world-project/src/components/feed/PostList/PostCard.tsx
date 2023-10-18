import React from 'react';
import './postCard.css';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';

type PostData = {
    img: string;
    name: string;
    likes: number;
    liked: boolean;
};
  
type PostCardProps = {
    data: PostData;
};
  
const PostCard = ({ data}: PostCardProps) => {
    return (
        <div className="PostCard">
            <img src={data.img} alt="" />
            <div className="reactions">
                {data.liked ? <FavoriteIcon className='like'/>: <FavoriteBorderIcon/>}   
                <CommentIcon/>
                <SendIcon />
            </div>
            <span>{data.likes} likes</span>
        </div>
    );
};

export default PostCard;
