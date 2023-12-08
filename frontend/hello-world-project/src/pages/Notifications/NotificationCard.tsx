import './notificationCard.css'
import { useAuth } from '../../providers/AuthProvider';
import { FriendshipOutput, useAcceptFriendRequest, useRejectFriendRequest } from '../../api/friend';

  
  type NotificationCardProps = {
    data: FriendshipOutput;
  };

function NotificationCard({ data }: NotificationCardProps) {
  const {userInfo} = useAuth();
  const handleAccept = useAcceptFriendRequest();
  const handleReject = useRejectFriendRequest();

  return (
    <div className="notificationCard">
      <img src={`${data.actor.profileImage}`} alt="" className="notificationCardImg" />
      <div className="notificationCardUsername">
          <span >{data.actor.displayName}</span>
      </div>
      <button onClick={async () => handleAccept.mutate({author: userInfo, actor: data.actor})} className='acceptButton'>Accept</button>
      <button onClick={async () => handleReject.mutate({author: userInfo, actor: data.actor})} className='rejectButton'>Reject</button>
    </div>
  )
}

export default NotificationCard
