import React from 'react'
import './leftbarList.css'
import HomeIcon from '@mui/icons-material/Home';
import TagIcon from '@mui/icons-material/Tag';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import PeopleIcon from '@mui/icons-material/People';


export default function LeftbarList() {
  return (
    <div className="leftwrapper">
      
          <ul className="leftbarList">
              <li className="leftbarListItem">
                <HomeIcon className="leftbarIcon"/>
                <span className="leftbarListItemText"> Home
                </span>
              </li>
              <li className="leftbarListItem">
                <TagIcon className="leftbarIcon"/>
                <span className="leftbarListItemText"> Private 
                </span>
              </li>
              <li className="leftbarListItem">
                <NotificationsIcon className="leftbarIcon"/>
                <span className="leftbarListItemText"> Notifications 
                </span>
              </li>
              <li className="leftbarListItem">
                <MailIcon className="leftbarIcon"/>
                <span className="leftbarListItemText"> Messages 
                </span>
              </li>
              <li className="leftbarListItem">
                <PeopleIcon className="leftbarIcon"/>
                <span className="leftbarListItemText"> Friends 
                </span>
              </li>
          </ul>
          <hr className="leftbarHr"/>
          
      </div>
  )
}
