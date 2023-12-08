import axios from 'axios'
import {getAuthorizationHeader} from './config'
import { enqueueSnackbar } from 'notistack';
import { AuthorOutput } from './author';
import { useQuery } from '@tanstack/react-query';

export interface FriendshipInput {

}

export interface FriendshipOutput {
    actor: AuthorOutput,
    object: AuthorOutput,
    summary: string,
    type: 'follow'
}


const useGetFriends = (author: AuthorOutput) => (
    useQuery({
        queryKey: ['friends', author.id],
        queryFn: async () => {
            const { data } = await axios.get<FriendshipOutput[]>(`${author.id}/friends`, {
                headers: {
                    Authorization: getAuthorizationHeader(author.host),
                },
            })
            return data
        }
    })
)

export { useGetFriends }