import React, {useState, useEffect} from 'react';
import './postCard.css';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import 'reactjs-popup/dist/index.css';
import ReactMarkdown from 'react-markdown';
import FriendCard from '../../../pages/Friends/FriendCard';
import { Alert } from '@mui/material';
import * as linkify  from 'linkifyjs';
import Linkify from 'react-linkify';
import Comment from './Comment';
import Popup from 'reactjs-popup';
import axios from "axios"
import APIURL, { getAuthorizationHeader } from "../../../api/config"
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, Navigate } from 'react-router-dom';


type Image = {
    id: number;
    image: string;
  }

type PostCardProps = {
    data: any;
    isLiked: boolean;
    likeid?: number;
    myposts?: boolean;
    Reload: () => void;
};


const PostCard = ({ data, myposts: isMyPosts, Reload, isLiked, likeid }: PostCardProps) => {
    const [isliked, setIsLiked] = React.useState(isLiked);
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [friendsList, setFriendsList] = useState<any[]>([]);
    const [userInfo, setUserInfo] = useState<any>({});
    const [likeId, setLikeId] = React.useState(likeid);
    console.log('isLiked:', isLiked);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLiked(isLiked);
      }, [isLiked]);

    const handleShare = () => {
        // send api post req
        setIsAlertVisible(true);

      };

    const handleLike = async () => {
        if (isliked) {
            setIsLiked(!isliked);
            try {
            const response = await axios.delete(`${APIURL}/unlike/${likeId}/`,
            {
            headers: {
                'Content-Type': 'application/json',
                Authorization: getAuthorizationHeader(),
            }
            });
            const responseData: any = response.data;
            console.log('unlike response: ', responseData);
            setIsLiked(false);
            return responseData;
        } catch (error: any) {
            console.log(error);
            
        };
            
        } else {
            setIsLiked(!isliked);
            try {
            const response = await axios.post(`${APIURL}/likes/`,
            {
                content_type: "post",
                content_id: data.id
            },
            {
            headers: {
                'Content-Type': 'application/json',
                Authorization: getAuthorizationHeader(),
            }
            });
            const responseData: any = response.data;
            console.log('like response: ', responseData);
            setLikeId(responseData.like_id)
            setIsLiked(true);
            return responseData;
        } catch (error: any) {
            console.log(error);
            
        };
        }
        

};
    const fetchUserInfo = async () => {
        try {
            const authorResponse = await axios.get(`${APIURL}/authors/${data.author}`, {headers: {Authorization: getAuthorizationHeader(),}});
            setUserInfo(authorResponse.data); 
            return authorResponse.data;
        } catch (error) {
            console.error('Error fetching user information: ', error);
        }
    };

    useEffect(() => {
        fetchUserInfo(); 
    }, [data]);

    const renderDescription = (description: string) => {
        if (linkify.test(description)) {
            return (
            <div style={{fontSize : 17, wordWrap: 'break-word'}}>
                <Linkify >{description}</Linkify> 
            </div>
            );
        } else {
            return (
            <div style={{fontSize : 2}}>
                <ReactMarkdown>{description}</ReactMarkdown>
            </div>
            );
        }
        };
    
    useEffect(() => {
        if (isAlertVisible) {
            const timer = setTimeout(() => {
                setIsAlertVisible(false);
            }, 1000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [isAlertVisible]);

    const getFriendList = async () => {
        try {
            const response = await axios.get(`${APIURL}/authors/friends/`, {
                headers: {
                "Content-Type": "application/json",
                Authorization: getAuthorizationHeader(),
                },
            });
            const friends: any[] = response.data;
            const authorFriends: any[] = []
            await Promise.all(
                friends.map(async (request) => {
                    try {
                        const authorResponse = await axios.get(`${APIURL}/authors/${request.sender}`, {headers: {Authorization: getAuthorizationHeader(),}});
                        const authorData = {
                            sender: authorResponse.data,
                        };
                        authorFriends.push(authorData); 
                    } catch (error) {
                        console.log("Error fetching author data:", error);
                    }
                })
            );
            setFriendsList(authorFriends)
            console.log('Friends:', authorFriends);
    
          } catch (error) {
            console.log(error);
          }
    }

    const PopupContent: React.FC = () => {
        if (isAlertVisible) {
            return(
            <Alert severity="success">Your message was sent successfully!</Alert>)
        }
        else{
            getFriendList()
            return(
                <div className='popupContainer'>
                    {friendsList.map((friend: any, id: number) => (
                    <FriendCard key={id} data={friend} shareList onClick={handleShare}
                    />))}
                </div>
            )
        }
        
    };

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`${APIURL}/post/delete/${data.id}/`,
            {
            headers: {
                'Content-Type': 'application/json',
                Authorization: getAuthorizationHeader(),
            }
            });
            const responseData: any = response.data;
            console.log('delete response: ', responseData);
            Reload();
            return responseData;
        } catch (error: any) {
            console.log(error);
            
        };
        
    }

    const handleEdit = () => {
        // navigate to /post page with data
        console.log("navigate: ")
        navigate('/post/edit', { state: { data: data } });
    }
    return (
        <div className="PostCard">
            <div className="postTop">
                <img src={`${APIURL}${userInfo.profilePicture}`} alt="" className="postProfileImg" />
                <div className="postUsername">
                    <span >{userInfo.displayName}</span>
                </div>
                {isMyPosts && 
                <div className="postOptions"> 
                    <DeleteIcon style={{color: "#ff6b6b"}} onClick={handleDelete}/>
                    <EditIcon style={{color: "#ff6b6b"}} onClick={handleEdit}>
                    </EditIcon>
                </div>}
            </div>
            {/* check if there is description and if so render it as markdown */}
            {data.text && renderDescription(data.text)}
            {data.image && <img src={`${APIURL}${data.image}`} alt="title" className='postImage'/>}
            <div className="reactions">
                {isliked ? <FavoriteIcon className='like' onClick={handleLike}/>: <FavoriteBorderIcon onClick={handleLike}/>}   
                <Popup trigger={<CommentIcon/>} position="right center" contentStyle={{ width: '40%', height: 'auto' }}>
                    { <Comment postID = {data.id} />}
                </Popup>
                <Popup trigger={<SendIcon />} position="right center" >
                    { <PopupContent />}
                </Popup>
            </div>
        </div>
    );
};

export default PostCard;
