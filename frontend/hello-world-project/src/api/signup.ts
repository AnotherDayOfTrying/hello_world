import APIURL from "./config"


export interface SignUpInterface {
    username: string,
    password: string,
    password2: string,
    displayName: string,
    github: string,
}

const signup = async (signupDetails: SignUpInterface) => {
    const response = await fetch(`${APIURL}/auth/signup/`, {
        headers: {
            "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify(signupDetails)
    })
    return await response.json();
}

export default signup;