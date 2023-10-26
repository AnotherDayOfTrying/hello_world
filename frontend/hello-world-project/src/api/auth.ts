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


const login = async (signinDetails: LoginInterface) => {
    const response = await fetch(`${APIURL}/auth/signin/`, {
        headers: {
            "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify(signinDetails),
    })

    return await response.json()
}

const signup = async (signupDetails: SignUpInterface) => {
    const response = await fetch(`${APIURL}/auth/signup/`, {
        headers: {
            "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify(signupDetails)
    })
    return await response.json()
}

const verifySession = async() => {
    const response = await fetch(`${APIURL}/api/session/`, {
        headers: {
            "X-CsrfToken": document.cookie
        }
    })

    const test = await response.json();

    // console.log(test)

    return response.ok
}

export {login, signup, verifySession}