
const APIURL: any = {
    "dev": "http://127.0.0.1:8000",
    "prod": "!!!NEED TO FILL THIS IN",
}

export default APIURL[process.env.ENV || "dev"];