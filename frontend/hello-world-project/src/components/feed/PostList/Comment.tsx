import React, {useState, useEffect} from 'react';
import './comment.css';
import CommentCard from './CommentCard';
import SendIcon from '@mui/icons-material/Send';
import { LikeListOutput, getAuthorsLikedAsync } from '../../../api/like';
import { useAuth } from '../../../providers/AuthProvider';
import { CommentListOutput, createCommentAsync, getCommentsAsync } from '../../../api/comment';
import { PostOutput } from '../../../api/post';



interface CommentProps {
  data: PostOutput;
  Reload: () => void;
}

const Comment: React.FC<CommentProps> = ({ data, Reload }) => {
  const [comments, setComments] = useState<CommentListOutput>()
  const [text, setText] = useState<string>('')
  const [likedComments, setLikedComments] = useState<LikeListOutput>();
  const {userInfo} = useAuth()

  const fetchLiked = async() => {
    setLikedComments(await getAuthorsLikedAsync(userInfo.id))
  }

  useEffect(() => {
    fetchLiked()
  }, [data]); 

    
  const getComments = async () => {
    setComments(await getCommentsAsync(data.comments))
  }

  useEffect(() => {
    getComments();
  }, [data]);

  const sendComment = async () => {
    createCommentAsync(data.comments, {
      author: userInfo,
      comment: text,
      contentType: 'text/plain',
    })
    .then(() => {Reload()})
  }
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setText(event.target.value);
};
    return (
        <div className="comments">
          {
          comments && comments.comments.length > 0 && likedComments ? 
            (
              comments.comments.map((comment) => {
              const isLiked = !!likedComments.items.find((likedComment) => likedComment.object === comment.id);
              return <CommentCard comment={comment} isLiked={isLiked} />})
            )
            :
            (
              (<h3 style={{padding: "1rem"}}>No Comments</h3>)
            )
          }
          <div className="sendComment">
            <input value={text} onChange={handleTextChange} placeholder='Add a comment'></input>
            <SendIcon onClick={sendComment} style={{color: "#ff6b6b", alignSelf: "center"}}></SendIcon>
          </div>
          
        </div>
      )
};

export default Comment;
