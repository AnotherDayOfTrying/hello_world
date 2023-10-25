import {TextField } from "@mui/material"
import {useNavigate} from "react-router-dom"
import { useAuth } from "../../providers/AuthProvider"
import { useEffect, useState } from "react"
import "./auth.css"
import { LoginInterface } from "../../api/login"

const Login = () => {
    const navigate = useNavigate()
    const {user, loginUser} = useAuth()
    const [loginData, setLoginData] = useState<LoginInterface>({
        username: "",
        password: "",
    })

    const [errorData, setErrorData] = useState<LoginInterface>({
        username: "",
        password: "",
    })


    useEffect(() => {
        if (user) {
            navigate("/home")
        }
    }, [])
    
    return (
    <div className="page">
        <div className="center-content">
            <form>
                <h1>Login</h1>
                <TextField id="username" label="username" variant="standard" onChange={(event) => {setLoginData({...loginData, username: event.target.value})}}  error={!!errorData.username} helperText={errorData.username} />
                <TextField id="password" label="password" variant="standard" type="password" onChange={(event) => {setLoginData({...loginData, password: event.target.value})}} error={!!errorData.password} helperText={errorData.password} />
                <div className="button-container">
                    <button className="postButton" onClick={() => {navigate("/signup")}}> SignUp </button>
                    <button className="postButton" onClick={async (event) => {event.preventDefault(); setErrorData({...await loginUser(true)})}}> Login </button>
                </div>
            </form>
        </div>
    </div>
    )
}

export default Login