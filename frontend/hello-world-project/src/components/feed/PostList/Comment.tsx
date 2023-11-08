import React, {useState, useEffect} from 'react';
import './comment.css';
import CommentCard from './CommentCard';
import axios, { AxiosError } from "axios"
import APIURL, { getAuthorizationHeader } from "../../../api/config"
import SendIcon from '@mui/icons-material/Send';
import { setTokenSourceMapRange } from 'typescript';



interface CommentProps {
    postID: number; 
}

const Comment: React.FC<CommentProps> = ({ postID }) => {
  const [data, setData] = useState<any[]>([])
  const [text, setText] = useState<string>('')
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
      console.log('comments:', comments);
      const commentsWithAuthors = await Promise.all(
          comments.map(async (request) => {
          const authorResponse = await axios.get(`${APIURL}/authors/${request.author}`, {headers: {Authorization: getAuthorizationHeader(),}});
          const authorData = {
            ...request,
            author: authorResponse.data,
          };
          console.log('author Data:', authorData);
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
          {data.length>0? (data.map((post: any, id: number) => {
            return <CommentCard post={post}/>})):
           (<h3 style={{padding: "1rem"}}>No Comments</h3>)}
          <div className="sendComment">
            <input value={text} onChange={handleTextChange} placeholder='Add a comment'></input>
            <SendIcon onClick={sendComment} style={{color: "#ff6b6b", alignSelf: "center"}}></SendIcon>
          </div>
          
        </div>
      )
};

export default Comment;
