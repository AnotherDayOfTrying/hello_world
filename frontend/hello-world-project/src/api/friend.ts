import axios from 'axios'
import {getAuthorizationHeader} from './config'
import { enqueueSnackbar } from 'notistack';
import { AuthorOutput } from './author';

export interface FriendshipInput {

}

export interface FriendshipOutput {
    actor: AuthorOutput,
    object: AuthorOutput,
    summary: string,
    type: 'follow'
}


const getFriendsAsync = async (authorId: string): Promise<FriendshipOutput[] | undefined> => { 
    try {
        const { data } = await axios.get<FriendshipOutput[]>(`${authorId}/friends`, {
            headers: {
                Authorization: getAuthorizationHeader(),
            },
        })
        return data
    } catch {
        enqueueSnackbar('Could not Fetch Friends', {variant: 'error'})
    }
}

export { getFriendsAsync }