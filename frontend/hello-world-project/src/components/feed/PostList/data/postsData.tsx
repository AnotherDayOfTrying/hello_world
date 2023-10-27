import pic1 from './post/1.jpg';
import pic2 from './post/2.jpg';
import pic3 from './post/3.jpg';
import ph1 from './person/1.jpg';
import ph2 from './person/2.jpg';
import ph3 from './person/3.jpg';

export const PostData = [
    {
        id: 1,
        description: "This is a post",
        img: pic1,
        name: "User 1",
        user_img: ph1,
        likes: 10,  
        liked: true,

    },
    {
        id: 2,
        description: "This is a **markdown** post",
        img: "",
        name: "User 2",
        user_img: ph2,
        likes: 40,  
        liked: false,

    },
    {
        id: 3,
        description: "",
        img: pic3,
        name: "User 3",
        user_img: ph3,
        likes: 140,  
        liked: true,

    }
]