import React from 'react';
import './comment.css';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';

type typePostData = {
    id: number;
    description: string;
    img: string;
    name: string;
    user_img: string;
    likes: number;
    liked: boolean;
}

type CommentCardProps = {
    post: typePostData; 
};

const CommentCard: React.FC<CommentCardProps> = ({ post }) => {
    const [likes, setLikes] = React.useState(post.likes);
    const [isliked, setIsLiked] = React.useState(post.liked);

    const handleLike = () => {
        setLikes(isliked ? likes -1 : likes + 1);
        setIsLiked(!isliked);
    };

    return (
        <div className="comment">
            <div className="comment_user">
                <img src={post.user_img} alt="" />
                <div className="comment_content">
                    <h3>{post.name}</h3>
                    <p>{post.description}</p>
                </div>
                <div className='Likes'>
                    {isliked ? <FavoriteIcon className='commentLike' onClick={handleLike}/>: <FavoriteBorderIcon className='commentLike' onClick={handleLike}/>}  
                    <div>{likes} </div> 
                </div>
            </div>
        </div>
    );
};

export default CommentCard;
