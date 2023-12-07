import React from 'react';
import Leftbar from '../../components/leftbar/Leftbar';
import Feed from '../../components/feed/Feed';
import Rightbar from '../../components/rightbar/Rightbar';
import './home.css';
import { PAGE_TYPE } from '../../App';
import { useAuth } from '../../providers/AuthProvider';

interface HomeProps {
  type: PAGE_TYPE
}

const Home: React.FC<HomeProps> = ({type}: HomeProps) => {
  const {user,
    userId,
    userInfo,
    verifiedSession,} = useAuth()
    console.log("USER", user)
    console.log("USERID", userId)
    console.log("USERINFO", userInfo)
    console.log("VERIFIEDSESSION", verifiedSession)
    
  return(
    <>
      <div className="homeContainer">
        <Leftbar/>
        <Feed type={type}/>
        <Rightbar/>
      </div>
    </>
  )
}

export default Home;