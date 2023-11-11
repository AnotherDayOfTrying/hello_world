import React, {useState} from 'react'
import './posts.css'
import PostCard from './PostCard'

interface PostsProps {
  data: any;
  myposts?: boolean;
  Reload: () => void;
}

const Posts: React.FC<PostsProps> = ({ data, myposts: isMyPosts, Reload }) => {
  return (
    <div className="posts">
      {data ? (
        isMyPosts ? (
          data.map((post: any, id: number) => {
            return <PostCard Reload={Reload} myposts data={post} />;
          })
        ) : (
          data.map((post: any, id: number) => {
            return <PostCard Reload={Reload} data={post} />;
          })
        )
      ) : null}
    </div>
  );
};

export default Posts
