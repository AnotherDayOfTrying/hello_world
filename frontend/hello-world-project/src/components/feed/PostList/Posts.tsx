import React, {useState, useEffect} from 'react'
import './posts.css'
import PostCard from './PostCard'
import APIURL, { getAuthorizationHeader } from "../../../api/config"
import axios, { AxiosError } from "axios"
import EmptyPostCard from './EmptyPostCard'

interface PostsProps {
  data: any;
  myposts?: boolean;
  Reload: () => void;
}

const Posts: React.FC<PostsProps> = ({ data, myposts: isMyPosts, Reload }) => {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const response = await axios.get(`${APIURL}/authors/likes/`, {headers: {Authorization: getAuthorizationHeader(),}});
        const likedPostIds = response.data.map((likedPost: any) => ({
          post_id: likedPost.content_object.post_id,
          like_id: likedPost.id,
        }));
        setLikedPosts(new Set(likedPostIds));
      } catch (error) {
        console.error('Error fetching liked posts:', error);
      }
    };

    fetchLikedPosts();
  }, [Reload]); 

  const dataIsEmpty = data ? data.length === 0 : false;
  return (
    <div className="posts">
      {data && !dataIsEmpty ? (
        isMyPosts ? (
          data.map((post: any, id: number) => {
            var isLiked = false;
            likedPosts.forEach((likedPost: any) => {
              if (likedPost.post_id === post.id) {
                isLiked = true;
                post.like_id = likedPost.like_id;
              }
            });
            return <PostCard Reload={Reload} myposts data={post} isLiked={isLiked} likeid={post.like_id}/>;
          })
        ) : (
          data.map((post: any, id: number) => {
            var isLiked = false;
            likedPosts.forEach((likedPost: any) => {
              if (likedPost.post_id === post.id) {
                isLiked = true;
                post.like_id = likedPost.like_id;
              }
            });
            return <PostCard Reload={Reload} data={post} isLiked={isLiked} likeid={post.like_id}/>;
          })
      )) : <EmptyPostCard />}
    </div>
  );
};

export default Posts
