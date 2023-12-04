import axios from 'axios'
import APIURL, {getAuthorizationHeader} from './config'
import { enqueueSnackbar } from 'notistack';

export interface AuthorInput {
    id: string,
    url: string,
    displayName: string,
    github: string | null,
    host: string,
}

export interface AuthorOutput {
    type: "author",
    id: string,
    url: string,
    displayName: string,
    profilePicture: string,
    github: string | null,
    host: string
  }

const getAuthorByAuthorIdAsync = async (authorId: string): Promise<AuthorOutput | undefined> => {
    try {
        const { data } = await axios.get<AuthorOutput>(`${APIURL}/authors/${authorId}`, {
            headers: {
                Authorization: getAuthorizationHeader(),
            }
        });
        return data
    } catch {
        enqueueSnackbar("Could not find current author", {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        return undefined
    }
}

const getAuthorAsync = async (url: string): Promise<AuthorOutput | undefined> => {
    try {
        const { data } = await axios.get<AuthorOutput>(url, {
            headers:  {
                Authorization: getAuthorizationHeader(),
            }
        })
        return data
    } catch {
        enqueueSnackbar("Could not find current author", {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        return undefined
    }
}

export {getAuthorAsync, getAuthorByAuthorIdAsync}