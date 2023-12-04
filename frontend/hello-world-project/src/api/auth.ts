import axios, { AxiosError } from "axios"
import { enqueueSnackbar } from 'notistack'
import APIURL from "./config"
import { AuthorOutput, getAuthorByAuthorIdAsync } from "./author";

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
    profilePicture: Blob | string | undefined,
}


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
            enqueueSnackbar("Something went wrong! Try again later.", {variant: 'error'})
            throw err;
        }
    }
    
}

const signup = async (signupDetails: SignUpInterface) => {
    const formData = new FormData()
    formData.append('username', signupDetails.username)
    formData.append('password', signupDetails.password)
    formData.append('password2', signupDetails.password2)
    formData.append('displayName', signupDetails.displayName)
    formData.append('github', signupDetails.github)
    if (signupDetails.profilePicture)
        formData.append('profilePicture', signupDetails.profilePicture)

    try {
        const response = await axios.post(`${APIURL}/signup/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        return await response.data
    } catch (err: any) {
        if (err instanceof AxiosError) {
            return err.response?.data
        } else {
            enqueueSnackbar("Something went wrong! Try again later.", {variant: 'error'})
            throw err;
        }
    }
}

const verifySession = async() => {
    try {
        const response = await axios.get(`${APIURL}/api/session/`, {
            headers: {
                "Authorization": "Token " + localStorage.getItem('user_token'),
            }
        })
        if (response.status !== 200) 
            return false

        const author = await getAuthorByAuthorIdAsync(localStorage.getItem('user_id') || '')
        return author!;
    } catch (err) {
        if (err instanceof AxiosError) {
            return false
        } else {
            enqueueSnackbar("Unable to verify session.", {variant: 'error'})
        }
    }
}

const logout = async() => {
    try {
        localStorage.removeItem('user_token')
        localStorage.removeItem('user_id')
        return true
    } catch (err) {
        enqueueSnackbar("Something went wrong! Try again later.", {variant: 'error'})
        return false
    }
}

export {login, signup, verifySession, logout}