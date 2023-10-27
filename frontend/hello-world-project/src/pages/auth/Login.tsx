import {TextField } from "@mui/material"
import {useNavigate} from "react-router-dom"
import { useAuth } from "../../providers/AuthProvider"
import { useEffect, useState } from "react"
import { LoginInterface } from "../../api/auth"
import gsap from "gsap"
import "./auth.css"

const Login = () => {
    const navigate = useNavigate()
    const {user, loginUser, verifiedSession} = useAuth()
    const [loginData, setLoginData] = useState<LoginInterface>({
        username: "",
        password: "",
    })

    const [errorData, setErrorData] = useState<LoginInterface & {non_field_errors: string}>({
        username: "",
        password: "",
        non_field_errors: "",
    })

    // check user authentication state on load
    useEffect(() => {
        if (user && verifiedSession) {
            navigateToHome()
        }
    }, [user, verifiedSession])

    useEffect(() => {
        if (!user) {
            gsap.to('form', {opacity: 1})
        }
    }, [])

    const signupOnClick = (event: any) => {
        event.preventDefault()
        gsap.to('form', {opacity: 0, onComplete: () => {
            navigate("/signup")
        }})
    }

    const navigateToHome = () => {
        gsap.to('form', {opacity: 0})
        gsap.to('.page', {backgroundColor: "#f3f3f3", onComplete: () => {
            navigate("/home")
        }})
    }
    
    return (
    <div className="page">
        <div className="center-content">
            <form>
                <span><h1>Login</h1><span style={{color: "red"}}>{errorData.non_field_errors?.toString()}</span></span>
                <TextField
                    id="username"
                    label="username"
                    variant="standard"
                    onChange={(event) => {setLoginData({...loginData, username: event.target.value})}}
                    error={!!errorData.username}
                    helperText={errorData.username} />
                <TextField 
                    id="password"
                    label="password"
                    variant="standard"
                    type="password"
                    onChange={(event) => {setLoginData({...loginData, password: event.target.value})}}
                    error={!!errorData.password}
                    helperText={errorData.password} />
                <div className="button-container">
                    <button
                        className="postButton"
                        onClick={(event) => {signupOnClick(event)}}
                        type="button">
                            SignUp
                    </button>
                    <button
                        className="postButton"
                        onClick={async (event) => {event.preventDefault(); setErrorData({...errorData, ...await loginUser(loginData)})}}
                        type="submit">
                            Login
                    </button>
                </div>
            </form>
        </div>
    </div>
    )
}

export default Login