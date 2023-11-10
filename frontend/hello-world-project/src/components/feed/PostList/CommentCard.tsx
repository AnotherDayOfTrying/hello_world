import React from 'react';
import './comment.css';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import APIURL, { getAuthorizationHeader } from "../../../api/config"
import axios from "axios"



type CommentCardProps = {
    post: any; 
};

const CommentCard: React.FC<CommentCardProps> = ({ post }) => {
    const [isliked, setIsLiked] = React.useState(false);
    const [likeId, setLikeId] = React.useState<number>(0);
    console.log('post:', post);
    const start = new Date(post.time);
    const end = new Date();
    let diff = (end.getTime() - start.getTime()) / 1000;
    let strDiff = '';
    // calculate the appropriate time unit
    if (diff < 60) {
        strDiff = Math.floor(diff) + 's';
    } else if (diff < 3600) {
        strDiff = Math.floor(diff / 60) + 'm';
    } else if (diff < 86400) {
        strDiff = Math.floor(diff / 3600) + 'h';
    } else if (diff < 604800) {
        strDiff = Math.floor(diff / 86400) + 'd';
    } else {
        strDiff = Math.floor(diff / 604800) + 'w';
    }


    const handleLike = async () => {
        if (isliked) {
            setIsLiked(!isliked);
            try {
            const response = await axios.delete(`${APIURL}/unlike/${likeId}/`,
            {
            headers: {
                'Content-Type': 'application/json',
                Authorization: getAuthorizationHeader(),
            }
            });
            const responseData: any = response.data;
            console.log('unlike response: ', responseData);
            setIsLiked(false);
            return responseData;
        } catch (error: any) {
            console.log(error);
            
        };
            
        } else {
            setIsLiked(!isliked);
            try {
                console.log('post id:', post.id);
            const response = await axios.post(`${APIURL}/likes/`,
            {
                content_type: "comment",
                content_id: post.id
            },
            {
            headers: {
                'Content-Type': 'application/json',
                Authorization: getAuthorizationHeader(),
            }
            });
            const responseData: any = response.data;
            console.log('like response: ', responseData);
            setLikeId(responseData.like_id)
            setIsLiked(true);
            return responseData;
        } catch (error: any) {
            console.log(error);
            
        };
        }
    };

    return (
        <div className="comment">
            <div className="comment_user">
                <img src={`${APIURL}${post.author.profilePicture}`} alt="" />
                <div className="comment_content">
                    <h4>{post.author.displayName}</h4>
                    <p>{post.comment}</p>
                </div>
                <div className="time">
                    <p>{strDiff}</p>
                </div>
                <div className='Likes'>
                    {isliked ? <FavoriteIcon className='commentLike' onClick={handleLike}/>: <FavoriteBorderIcon className='commentLike' onClick={handleLike}/>}  
                </div>
            </div>
        </div>
    );
};

export default CommentCard;
