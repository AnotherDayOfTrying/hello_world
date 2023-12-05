
const APIURL: {[key: string]: string} = {
    "development": "http://127.0.0.1:8000",
    "production": "https://cmput404-project-backend-a299a47993fd.herokuapp.com",
}

export const getAuthorizationHeader = () => `Token ${localStorage.getItem('user_token') || ''}`;
export const getAuthorId = () => localStorage.getItem('user_id') || '';

export default APIURL[process.env.NODE_ENV || "development"];