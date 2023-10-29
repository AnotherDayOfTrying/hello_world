
const APIURL: any = {
    "dev": "http://127.0.0.1:8000",
    "prod": "https://cmput404-project-backend-a299a47993fd.herokuapp.com",
}

console.log(JSON.stringify(process.env, null, 2))

export default APIURL[process.env.ENV || "dev"];