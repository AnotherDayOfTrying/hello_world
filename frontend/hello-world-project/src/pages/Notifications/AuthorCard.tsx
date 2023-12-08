import './authorCard.css'
import { AuthorOutput } from '../../api/author'
import { useAuth } from '../../providers/AuthProvider'
import { useSendFriendRequest } from '../../api/friend'
import { Chip } from '@mui/material'
import { getGroupName } from '../../api/config'

interface AuthorCardProps {
    data: AuthorOutput
}

export const AuthorCard = ({ data }: AuthorCardProps) => {
    const {userInfo} = useAuth()
    const sendRequestHandler = useSendFriendRequest()

    const handleFriendRequest = async () => {
        sendRequestHandler.mutate({
            author: data,
            sendFriendRequestInput: {
                type: 'follow',
                summary: `${userInfo.displayName} wants to friend to you`,
                actor: userInfo,
                object: data
            }
        })
    }

    return (
        <div className="authorCard">
            <Chip label={getGroupName(data.host)} variant="outlined" />
            <img src={`${data.profileImage}`} alt="" className="authorCardImg" />
            <div className="authorCardUsername">
                <span >{data.displayName}</span>
            </div>
            <button onClick={handleFriendRequest} className='requestButton'>Send Friend Request</button>
        </div>
    )
}