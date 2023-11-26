import Icon from './data/no-color-icon.svg'
import './EmptyPostCard.css'
import './postCard.css';


const EmptyPostCard = () => {
    return (
        <div className="PostCard">
            <div className="EmptyPostCard">
                <img height={50} width={50} src={Icon}/>
                <p>There are no posts...</p>
            </div>
        </div>
    )
}


export default EmptyPostCard