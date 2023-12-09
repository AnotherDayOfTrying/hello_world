import React, { useState } from 'react';
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
  const [categoryFilter, setCategory] = useState<string[]>([])

  const onChange = (value: string[]) => {
    setCategory(value)
  }

  return(
    <>
      <div className="homeContainer">
        <Leftbar/>
        <Feed filter={categoryFilter} type={type}/>
        <Rightbar value={categoryFilter} onChange={onChange}/>
      </div>
    </>
  )
}

export default Home;