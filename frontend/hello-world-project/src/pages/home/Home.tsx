import React from 'react';
import Leftbar from '../../components/leftbar/Leftbar';
import Feed from '../../components/feed/Feed';
import Rightbar from '../../components/rightbar/Rightbar';
import './home.css';
import { useAuth } from '../../providers/AuthProvider';


interface HomeProps {
  private?: boolean;
  unlisted?: boolean;
  myposts?: boolean;
}

const Home: React.FC<HomeProps> = ({ private: isPrivate, unlisted: isUnlisted,  myposts: isMyPosts }: HomeProps) => {

  const {user,
    userId,
    userInfo,
    verifiedSession,} = useAuth()
    console.log("USER", user)
    console.log("USERID", userId)
    console.log("USERINFO", userInfo)
    console.log("VERIFIEDSESSION", verifiedSession)

  if (isPrivate) {
    return(
    <>
    <div className="homeContainer">
      <Leftbar/>
      <Feed private/>
      <Rightbar/>
    </div>
    </>
    )
  }

  else if (isUnlisted) {
    return (
    <>
    <div className="homeContainer">
      <Leftbar/>
      <Feed unlisted/>
      <Rightbar/>
    </div>
    </>
    )
  }
  else if (isMyPosts) {
    return (
    <>
    <div className="homeContainer">
      <Leftbar/>
      <Feed myposts/>
      <Rightbar/>
    </div>
    </>
    )
  }
  else {
  return (
    <>
    <div className="homeContainer">
      <Leftbar/>
      <Feed/>
      <Rightbar/>
    </div>
    </>
    
  );
  }
}

export default Home;