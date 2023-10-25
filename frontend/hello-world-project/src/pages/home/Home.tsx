import React from 'react';
import Leftbar from '../../components/leftbar/Leftbar';
import Feed from '../../components/feed/Feed';
import Rightbar from '../../components/rightbar/Rightbar';
import './home.css';


interface HomeProps {
  private?: boolean;
  unlisted?: boolean;
  messages?: boolean;
}

const Home: React.FC<HomeProps> = ({ private: isPrivate, unlisted: isUnlisted, messages: ismessages }: HomeProps) => {
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
  else if (ismessages) {
    return (
    <>
    <div className="homeContainer">
      <Leftbar/>
      <Feed messages/>
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