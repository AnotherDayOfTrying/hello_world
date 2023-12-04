import axios from 'axios'
import APIURL, {getAuthorizationHeader} from './config'
import { enqueueSnackbar } from 'notistack';
import { AuthorInput, AuthorOutput } from './author';


export interface LikeInput {
    type: 'Like',
    author: AuthorInput,
    object: string,
}

export interface LikeOutput {
    author: AuthorOutput,
    object: string,
    summary: string,
    type: 'Like'
}

export interface LikeListOutput {
    type: 'liked',
    items: LikeOutput[],
}

const likeObjectAsync = async (authorId: string, likeInput: LikeInput): Promise<LikeOutput | undefined> => {
    try {
        const { data } = await axios.post<LikeOutput>(`${authorId}/inbox`, likeInput, {
            headers: {
                Authorization: getAuthorizationHeader(),
            }
        })
        return data
    } catch {
        enqueueSnackbar('Unable to Like Post', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        return undefined
    }
}

const getAuthorsLikedAsync = async (authorId: string): Promise<LikeListOutput | undefined> => {
    try {
        const { data } = await axios.get<LikeListOutput>(`${authorId}/liked`, {
            headers: {
                Authorization: getAuthorizationHeader(),
            }
        })
        return data;
    } catch {
        enqueueSnackbar('Unable to Fetch Liked Objects', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        return undefined
    }
}

export {likeObjectAsync, getAuthorsLikedAsync}