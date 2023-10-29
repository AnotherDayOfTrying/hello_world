import React from 'react';
import './comment.css';
import CommentCard from './CommentCard';


interface CommentProps {
    data: any; 
}

const Comment: React.FC<CommentProps> = ({ data }) => {
    return (
        <div className="comments">
          {data.map((post: any, id: number) => {
            return <CommentCard post={post}/>})}
        </div>
      )
};

export default Comment;
