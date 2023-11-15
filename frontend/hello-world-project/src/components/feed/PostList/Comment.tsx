import React, {useState, useEffect} from 'react';
import './comment.css';
import CommentCard from './CommentCard';
import axios, { AxiosError } from "axios"
import APIURL, { getAuthorizationHeader } from "../../../api/config"
import SendIcon from '@mui/icons-material/Send';



interface CommentProps {
    postID: number; 
}

const Comment: React.FC<CommentProps> = ({ postID }) => {
  const [data, setData] = useState<any[]>([])
  const [text, setText] = useState<string>('')
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchLikedComments = async () => {
      try {
        const response = await axios.get(`${APIURL}/authors/likes/`, {headers: {Authorization: getAuthorizationHeader(),}});
        const likedCommentIds = response.data.map((likedComment: any) => ({
          comment_id: likedComment.content_object.comment_id,
          like_id: likedComment.id,
        }));
        setLikedComments(new Set(likedCommentIds));
      } catch (error) {
        console.error('Error fetching liked comments:', error);
      }
    };

    fetchLikedComments();
  }, [postID]); 

  const date = new Date();
    
  const getComments = async () => {
    try {
      const response = await axios.get(`${APIURL}/comments/get/${postID}`, {
          headers: {
          "Content-Type": "application/json",
          Authorization: getAuthorizationHeader(),
          },
      });
      const comments: any[] = response.data.items;
      const commentsWithAuthors = await Promise.all(
          comments.map(async (request) => {
          const authorResponse = await axios.get(`${APIURL}/authors/${request.author}`, {headers: {Authorization: getAuthorizationHeader(),}});
          const authorData = {
            ...request,
            author: authorResponse.data,
          };
          return authorData;
        })
      );
      console.log('comments:', commentsWithAuthors);
      setData(commentsWithAuthors);

    } catch (error) {
      console.log(error);
    }
    
  }

  useEffect(() => {
    getComments();
  }, [postID]);

  const sendComment = async () => {
    try {
      const response = await axios.post(`${APIURL}/comments/${postID}/`,
      {
        comment: text,
        time: date.getHours() + ':' + date.getMinutes() 
      },
      {
      headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthorizationHeader(),
      }
      });
      const responseData: any = response.data;
      console.log('send comment response: ', responseData);
      setText('')
      getComments();
      return responseData;
  } catch (error: any) {
      console.log(error);
      
  };
  }
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setText(event.target.value);
};
    return (
        <div className="comments">
          {data.length>0? (data.map((comment: any, id: number) => {
            let isLiked = false;
            likedComments.forEach((likedComment: any) => {
              if (likedComment.comment_id === comment.id) {
                isLiked = true;
                comment.like_id = likedComment.like_id;
              }

            });
            return <CommentCard comment={comment} isLiked={isLiked} likeid={comment.like_id}/>})):
           (<h3 style={{padding: "1rem"}}>No Comments</h3>)}
          <div className="sendComment">
            <input value={text} onChange={handleTextChange} placeholder='Add a comment'></input>
            <SendIcon onClick={sendComment} style={{color: "#ff6b6b", alignSelf: "center"}}></SendIcon>
          </div>
          
        </div>
      )
};

export default Comment;
