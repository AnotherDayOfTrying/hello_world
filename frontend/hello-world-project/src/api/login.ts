import APIURL from "./config"

export interface LoginInterface {
    username: string;
    password: string;
}


const login = async (signinDetails: LoginInterface) => {
    const response = await fetch(`${APIURL}/auth/signin/`, {
        headers: {
            "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify(signinDetails),
    })

    return await response.json();
}


export default login;