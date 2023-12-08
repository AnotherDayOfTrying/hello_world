const APIURLS: {[key: string]: string} = {
    "development": "http://127.0.0.1:8000",
    "production": "https://cmput404-project-backend-a299a47993fd.herokuapp.com",
}


// export const HOSTS = [
//     // 'https://cmput404-project-backend-a299a47993fd.herokuapp.com/',
//     'https://chimp-chat-1e0cca1cc8ce.herokuapp.com/',
//     'https://webwizards-backend-952a98ea6ec2.herokuapp.com/service/',
//     // 'https://distributed-network-37d054f03cf4.herokuapp.com/api/'
// ]

export const getAuthorizationHeader = (host?: string) => {
    const AUTHORIZATION: {[key: string]: string} = {
        ['https://cmput404-project-backend-a299a47993fd.herokuapp.com/']: `Token ${localStorage.getItem('user_token') || ''}`,
        ['http://localhost:8000/']: `Token ${localStorage.getItem('user_token') || ''}`,
        ['https://chimp-chat-1e0cca1cc8ce.herokuapp.com/']: `Basic ${btoa("node-hello-world:chimpchatapi")}`,
        ['https://webwizards-backend-952a98ea6ec2.herokuapp.com/service/']: `Basic ${btoa("node-hello-world:socialpassword")}`,
        ['https://distributed-network-37d054f03cf4.herokuapp.com/']: `Basic ${btoa("node-hello-world:node-hello-world")}`
    }
    return host ? AUTHORIZATION[host] : `Token ${localStorage.getItem('user_token') || ''}`
};

export const getAuthorId = () => localStorage.getItem('user_id') || '';

export const APIURL = APIURLS[process.env.NODE_ENV || "development"];

export const REFRESH_INTERVAL = 3000