import React, {useState, useEffect} from 'react'
import './posts.css'
import PostCard from './PostCard'
import { PostOutput } from '../../../api/post'
import EmptyPostCard from './EmptyPostCard'
import { LikeListOutput, useGetAuthorsLiked } from '../../../api/like'
import { useAuth } from '../../../providers/AuthProvider'
import { FriendshipOutput, useGetFriends } from '../../../api/friend'
import { PAGE_TYPE } from '../../../App'
import { CircularProgress } from '@mui/material'

interface PostsProps {
  data: PostOutput[] | undefined;
  type: PAGE_TYPE;
}

const Posts: React.FC<PostsProps> = ({ data, type}) => {
  const {userInfo} = useAuth();

  const liked = useGetAuthorsLiked(userInfo)
  const friends = useGetFriends(userInfo)

  if (liked.isLoading) {
    return (
      <div className='posts'>
        <CircularProgress/>
      </div>
    )
  }

  return (
    <div className='posts'>
      {
        data && data.length > 0 ?
          data.map((post) => {
            const isLiked = !!liked.data!.items.find((likedPost) => likedPost.object === post.id);
            return <PostCard key={post.id} type={type} data={post} isLiked={isLiked} friends={[]} />
          })
        :
          <EmptyPostCard />
      }
    </div>
  )

  // useEffect(() => {
  //   if (userInfo) {
  //     fetchLiked()
  //     fetchFriends()
  //   }
  // }, [Reload]); 

  // const dataIsEmpty = data ? data.length === 0 : false;
  // return (
  //   <div className="posts">
  //     {data && !dataIsEmpty && likedPosts ? (
  //       isMyPosts ? (
  //         data.map((post) => {
  //           const isLiked = !!likedPosts.items.find((likedPost) => likedPost.object === post.id);
  //           return <PostCard Reload={Reload} myposts data={post} isLiked={isLiked} friends={friends!} />;
  //         })
  //       ) : (
  //         data.map((post) => {
  //           const isLiked = !!likedPosts.items.find((likedPost) => likedPost.object === post.id);
  //           return <PostCard Reload={Reload} data={post} isLiked={isLiked} friends={friends!} />;
  //         })
  //     )) : <EmptyPostCard />}
  //   </div>
  // );
};

export default Posts
