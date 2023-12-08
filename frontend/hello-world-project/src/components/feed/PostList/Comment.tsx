import React, {useState, useEffect} from 'react';
import './comment.css';
import CommentCard from './CommentCard';
import SendIcon from '@mui/icons-material/Send';
import { LikeListOutput } from '../../../api/like';
import { useAuth } from '../../../providers/AuthProvider';
import { useCreateComment, useGetComments } from '../../../api/comment';
import { PostOutput } from '../../../api/post';



interface CommentProps {
  data: PostOutput;
  liked: LikeListOutput
}

const Comment: React.FC<CommentProps> = ({ data, liked }) => {
  const [text, setText] = useState<string>('')
  const {userInfo} = useAuth()
  const comments = useGetComments(data)
  const createCommentHandler = useCreateComment();


  const sendComment = async () => {
    createCommentHandler.mutate({
      post: data,
      commentInput: {
        author: userInfo,
        comment: text,
        contentType: 'text/plain',
      }
    })
    setText('')
  }


  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setText(event.target.value);
  };
    return (
        <div className="comments">
          {
          comments.isSuccess && comments.data.comments.length > 0 ? 
            (
              comments.data!.comments.map((comment, index) => {
              const isLiked = !!liked.items.find((likedComment) => likedComment.object === comment.id);
              return <CommentCard comment={comment} isLiked={isLiked} key={index}/>})
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
