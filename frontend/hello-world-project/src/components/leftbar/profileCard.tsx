import './profileCard.css'
import APIURL, { getAuthorizationHeader } from '../../api/config'
import {useState, useEffect} from 'react'
import axios from 'axios'

export default function ProfileCard() {
  const [author, setAuthor] = useState<any>({})
  

  const fetchData = async () => {
    try {
      const response = await axios.get(`${APIURL}/author/`, {
        headers: {
          Authorization: getAuthorizationHeader()
        }
      })
      setAuthor(response.data.item)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])


  console.log(author)
  return (
    <div className='profileCard'>
      <div className='profileImages'>
        <img className='profile' src={APIURL + author.profilePicture} alt='' />
        <img className='background' src='/assets/post/4.jpg' alt='' />
      </div>
      <div className='profileName'>
        <span>{author.displayName}</span>
      </div>
    </div>
  )
}