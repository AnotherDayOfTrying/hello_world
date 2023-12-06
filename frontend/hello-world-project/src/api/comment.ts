import axios from 'axios'
import APIURL, {getAuthorizationHeader} from './config'
import { enqueueSnackbar } from 'notistack';
import { AuthorInput, AuthorOutput } from './author';

type CONTENT_TYPE = 'text/plain' | 'text/markdown' | 'application/base64' | 'image/png' | 'image/jpeg'

export interface CommentInput {
    author: AuthorInput,
    comment: string,
    contentType: CONTENT_TYPE
}

export interface CommentOutput {
    author: AuthorOutput,
    id: string,
    comment: string,
    contentType: string,
    published: string,
    type: 'comment'
}

export interface CommentListOutput {
    type: 'comments',
    comments: CommentOutput[],
}

const getCommentsAsync = async(url: string): Promise<CommentListOutput | undefined> => {
    try {
        const { data } = await axios.get<CommentListOutput>(url, {
            headers: {
                Authorization: getAuthorizationHeader()
            }
        })
        return data
    } catch {
        // enqueueSnackbar(`Unable to Fetch Comments`, {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
    }
}

const createCommentAsync = async (commentURL: string, commentInput: CommentInput) => {
    try {
        const { data } = await axios.post<CommentOutput>(`${commentURL}`, commentInput, {
            headers: {
                Authorization: getAuthorizationHeader()
            }
        });
        enqueueSnackbar('Created Comment', {variant: 'success', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        return data
    } catch {
        enqueueSnackbar('Unable to Create Comment', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
    }
}

export { createCommentAsync, getCommentsAsync }