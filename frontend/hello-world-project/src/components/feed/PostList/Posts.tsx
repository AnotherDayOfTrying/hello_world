import React, {useState, useEffect} from 'react'
import './posts.css'
import PostCard from './PostCard'
import { PostOutput } from '../../../api/post'
import EmptyPostCard from './EmptyPostCard'
import { LikeListOutput, getAuthorsLikedAsync } from '../../../api/like'
import { useAuth } from '../../../providers/AuthProvider'
import { FriendshipOutput, getFriendsAsync } from '../../../api/friend'

interface PostsProps {
  data: PostOutput[];
  myposts?: boolean;
  Reload: () => void;
}

const Posts: React.FC<PostsProps> = ({ data, myposts: isMyPosts, Reload }) => {
  const [likedPosts, setLikedPosts] = useState<LikeListOutput>();
  const [friends, setFriends] = useState<FriendshipOutput[]>();
  const {userInfo} = useAuth();

  const fetchLiked = async() => {
    setLikedPosts(await getAuthorsLikedAsync(userInfo.id))
  }

  const fetchFriends = async () => {
    setFriends(await getFriendsAsync(userInfo.id))
  }

  useEffect(() => {
    if (userInfo) {
      fetchLiked()
      fetchFriends()
    }
  }, [Reload]); 

  const dataIsEmpty = data ? data.length === 0 : false;
  return (
    <div className="posts">
      {data && !dataIsEmpty && likedPosts ? (
        isMyPosts ? (
          data.map((post) => {
            const isLiked = !!likedPosts.items.find((likedPost) => likedPost.object === post.id);
            return <PostCard Reload={Reload} myposts data={post} isLiked={isLiked} friends={friends!} />;
          })
        ) : (
          data.map((post) => {
            const isLiked = !!likedPosts.items.find((likedPost) => likedPost.object === post.id);
            return <PostCard Reload={Reload} data={post} isLiked={isLiked} friends={friends!} />;
          })
      )) : <EmptyPostCard />}
    </div>
  );
};

export default Posts
