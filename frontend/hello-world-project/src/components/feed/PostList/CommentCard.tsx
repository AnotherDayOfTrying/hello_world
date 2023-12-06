import React, {useEffect} from 'react';
import './comment.css';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { CommentOutput } from '../../../api/comment';
import { likeObjectAsync } from '../../../api/like';
import { useAuth } from '../../../providers/AuthProvider';



type CommentCardProps = {
    comment: CommentOutput; 
    isLiked: boolean;
};

const CommentCard: React.FC<CommentCardProps> = ({ comment, isLiked }) => {
    const [isliked, setIsLiked] = React.useState(isLiked);
    const {userInfo} = useAuth()

    useEffect(() => {
        setIsLiked(isLiked);
      }, [isLiked]);

    const handleLike = async () => {
        if (isliked) {
            setIsLiked(!isliked);
            // try {
            // const response = await axios.delete(`${APIURL}/unlike/${likeId}/`,
            // {
            // headers: {
            //     'Content-Type': 'application/json',
            //     Authorization: getAuthorizationHeader(),
            // }
            // });
            // const responseData: any = response.data;
            // console.log('unlike response: ', responseData);
            // setIsLiked(false);
            // return responseData;
            // } catch (error: any) {
            //     console.log(error);     
            // };
        } else {
            setIsLiked(!isliked);
            try {
                const response = await likeObjectAsync(comment.author, {
                    type: 'Like',
                    author: userInfo,
                    object: comment.id,
                })
                setIsLiked(true);
                return response;
            } catch (error: any) {
            console.log(error); 
        };
        }
    };

    const date = new Date(comment.published)

    return (
        <div className="comment">
            <div className="comment_user">
                <img src={`${comment.author.profileImage}`} alt="" />
                <div className="comment_content">
                    <h4>{comment.author.displayName}</h4>
                    <p>{comment.comment}</p>
                </div>
                <div className="time">
                    <p>{`${date.toDateString()} ${date.toTimeString()}`}</p>
                </div>
                <div className='Likes'>
                    {isliked ? <FavoriteIcon className='commentLike' onClick={handleLike}/>: <FavoriteBorderIcon className='commentLike' onClick={handleLike}/>}  
                </div>
            </div>
        </div>
    );
};

export default CommentCard;
