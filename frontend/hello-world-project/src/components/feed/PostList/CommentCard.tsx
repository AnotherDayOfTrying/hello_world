import React, {useEffect} from 'react';
import './comment.css';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import APIURL, { getAuthorizationHeader } from "../../../api/config"
import axios from "axios"



type CommentCardProps = {
    comment: any; 
    isLiked: boolean;
    likeid?: number;
};

const CommentCard: React.FC<CommentCardProps> = ({ comment, isLiked, likeid }) => {
    const [isliked, setIsLiked] = React.useState(isLiked);
    const [likeId, setLikeId] = React.useState(likeid);

    useEffect(() => {
        setIsLiked(isLiked);
      }, [isLiked]);

    console.log('comment:', comment);
    const start = new Date(comment.time);
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
                console.log('comment id:', comment.id);
            const response = await axios.post(`${APIURL}/likes/`,
            {
                content_type: "comment",
                content_id: comment.id
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
                <img src={`${APIURL}${comment.author.profilePicture}`} alt="" />
                <div className="comment_content">
                    <h4>{comment.author.displayName}</h4>
                    <p>{comment.comment}</p>
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
