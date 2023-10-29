import axios, { AxiosError } from "axios"
import APIURL from "./config"

export interface LoginInterface {
    username: string;
    password: string;
}

export interface SignUpInterface {
    username: string,
    password: string,
    password2: string,
    displayName: string,
    github: string,
}

axios.defaults.withCredentials = true // required to send session cookies with api requests
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'x-csrftoken'


const login = async (signinDetails: LoginInterface) => {
    try {
        const response = await axios.post(`${APIURL}/signin/`, signinDetails, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        return await response.data
    } catch (err: any) {
        if (err instanceof AxiosError) {
            return err.response?.data
        } else {
            throw err;
        }
    }
    
}

const signup = async (signupDetails: SignUpInterface) => {
    try {
        const response = await axios.post(`${APIURL}/signup/`, signupDetails, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        return await response.data
    } catch (err: any) {
        if (err instanceof AxiosError) {
            return err.response?.data
        } else {
            throw err;
        }
    }
}

const verifySession = async() => {
    try {
        const response = await axios.get(`${APIURL}/api/session/`)
        return response.status === 200
    } catch (err) {
        return false
    }
}

export {login, signup, verifySession}