import { TextField } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../../providers/AuthProvider"
import { SignUpInterface } from "../../api/auth"
import "./auth.css"


const Signup = () => {

    const navigate = useNavigate()
    const {signupUser} = useAuth();
    const [signupData, setSignupData] = useState<SignUpInterface>({
        username: "",
        password: "",
        password2: "",
        displayName: "",
        github: "",
    });

    const [errorData, setErrorData] = useState<SignUpInterface>({
        username: "",
        password: "",
        password2: "",
        displayName: "",
        github: "",
    });
    
    return (
        <div className="page">
            <div className="center-content">
                <form>
                    <h1>SignUp</h1>
                    <TextField
                        id="username"
                        label="username"
                        variant="standard"
                        onChange={(event) => {setSignupData({...signupData, username: event.target.value})}}
                        error={!!errorData.username}
                        helperText={errorData.username}
                        required={true}/>
                    <TextField
                        id="password"
                        label="password"
                        variant="standard"
                        type="password"
                        onChange={(event) => {setSignupData({...signupData, password: event.target.value})}}
                        error={!!errorData.password}
                        helperText={errorData.password}
                        required={true}/>
                    <TextField
                        id="password2"
                        label="confirm password"
                        variant="standard"
                        type="password"
                        onChange={(event) => {setSignupData({...signupData, password2: event.target.value})}}
                        error={!!errorData.password2}
                        helperText={errorData.password2}
                        required={true}/>
                    <TextField
                        id="displayName"
                        label="Display Name"
                        variant="standard"
                        onChange={(event) => {setSignupData({...signupData, displayName: event.target.value})}}
                        error={!!errorData.displayName}
                        helperText={errorData.displayName}
                        required={true}/>
                    <TextField
                        id="github"
                        label="GitHub Link"
                        variant="standard"
                        onChange={(event) => {setSignupData({...signupData, github: event.target.value})}}
                        error={!!errorData.github}
                        helperText={errorData.github}/>

                    <div className="button-container">
                        <button
                            className="postButton"
                            onClick={async (event) => {
                                event.preventDefault();
                                setErrorData({...await signupUser(signupData)
                            })}}>
                                SignUp 
                        </button>
                        <button
                            className="postButton"
                            onClick={() => {navigate("/login")}}>
                                Already Have an Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Signup