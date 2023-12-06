import axios from 'axios'
import APIURL, {getAuthorizationHeader, addReferer} from './config'
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
    profileImage: string,
    github: string | null,
    host: string
}

export interface AuthorListOutput {
    items: AuthorOutput[],
    pagination: {
        next: string | undefined,
        previous: string | undefined,
        page_number: number,
        page_size: number,
    },
    type: 'authors'
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
        // enqueueSnackbar("Could not find current author", {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        return undefined
    }
}

const getAuthorAsync = async (author: AuthorOutput): Promise<AuthorOutput | undefined> => {
    try {
        const { data } = await axios.get<AuthorOutput>(author.id, {
            headers:  {
                Authorization: getAuthorizationHeader(author.host),
            }
        })
        return data
    } catch {
        // enqueueSnackbar("Could not find current author", {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        return undefined
    }
}

const getAllLocalAuthorsAsync = async (): Promise<AuthorListOutput | undefined> => {
    try {
        const { data } = await axios.get<AuthorListOutput>(`${APIURL}/authors/`, {
            headers: {
                Authorization: getAuthorizationHeader()
            }
        })
        return data
    } catch {
        // enqueueSnackbar('Unable to Fetch All Authors', {variant: 'error'})
        return undefined
    }
}

export {getAuthorAsync, getAuthorByAuthorIdAsync, getAllLocalAuthorsAsync}