import React from 'react'
import './leftbarList.css'
import HomeIcon from '@mui/icons-material/Home';
import TagIcon from '@mui/icons-material/Tag';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import PeopleIcon from '@mui/icons-material/People';
import EditNoteIcon from '@mui/icons-material/EditNote';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { NavLink } from 'react-router-dom';




export default function LeftbarList() {

  return (
    <div className="leftwrapper">
          <ul className="leftbarList">
              <li className="leftbarListItem">
                <NavLink to="/home" className="leftbarLink" end> 
                  <HomeIcon className="leftbarIcon"/>
                  <span className="leftbarListItemText"> Home </span>
                </NavLink>
              </li>
              <li className="leftbarListItem">
                <NavLink to="/private" className="leftbarLink" end>
                  <TagIcon className="leftbarIcon"/>
                  <span className="leftbarListItemText"> Private </span>
                </NavLink>
              </li>
              <li className="leftbarListItem">
                <NavLink to="/unlisted" className="leftbarLink" end>
                  <VisibilityOffIcon className="leftbarIcon"/>
                  <span className="leftbarListItemText"> Unlisted </span>
                </NavLink>
              </li>
              <li className="leftbarListItem">
                <NavLink to="/messages" className="leftbarLink" end>
                  <MailIcon className="leftbarIcon"/>
                  <span className="leftbarListItemText"> Messages </span>
                </NavLink>
              </li>
              <li className="leftbarListItem">
                <NavLink to="/notifications" className="leftbarLink" end>
                  <NotificationsIcon className="leftbarIcon"/>
                  <span className="leftbarListItemText"> Notifications </span>
                </NavLink>
              </li>
              <li className="leftbarListItem">
                <NavLink to="/friends" className="leftbarLink" end>
                  <PeopleIcon className="leftbarIcon"/>
                  <span className="leftbarListItemText"> Friends </span>
                </NavLink>
              </li>
              <li className="leftbarListItem">
                <NavLink to="/myposts" className="leftbarLink" end>
                  <EditNoteIcon className="leftbarIcon"/>
                  <span className="leftbarListItemText"> My Posts </span>
                </NavLink>
              </li>
          </ul>
          <hr className="leftbarHr"/>
          
      </div>
  )
}
