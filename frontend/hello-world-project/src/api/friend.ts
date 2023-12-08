import axios from 'axios'
import {REFRESH_INTERVAL, getAuthorizationHeader} from './config'
import { enqueueSnackbar } from 'notistack';
import { AuthorOutput } from './author';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface FriendshipInput {
    type: 'follow',
    summary: string,
    actor: AuthorOutput,
    object: AuthorOutput,
}

export interface FriendshipOutput {
    actor: AuthorOutput,
    object: AuthorOutput,
    summary: string,
    type: 'follow'
}

const useSendFriendRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {author: AuthorOutput, sendFriendRequestInput: FriendshipInput}) => {
            const {author, sendFriendRequestInput} = args;
            await axios.post(`${author.id}/inbox`, sendFriendRequestInput, {
                headers: {
                    Authorization: getAuthorizationHeader(author.host),
                }
            })
        },
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['friend-requests']})
    })
}

const useAcceptFriendRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {author: AuthorOutput, actor: AuthorOutput}) => {
            const {author, actor} = args
            const actorId = actor.id.split('/').pop()
            await axios.put(`${author.id}/followers/${actorId}`, {
                type: 'follow',
                summary: `${author.displayName} accepted your friend request`,
                actor: actor,
                object: author,
            }, {
                headers: {
                    Authorization: getAuthorizationHeader(author.host)
                }
            })
        },
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['friend-requests', 'friends']})
    })
}

const useRejectFriendRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {author: AuthorOutput, actor: AuthorOutput}) => {
            const {author, actor} = args
            const actorId = actor.id.split('/').pop()
            await axios.delete(`${author.id}/followers/${actorId}`, {
                headers: {
                    Authorization: getAuthorizationHeader(author.host)
                }
            })
        },
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['friend-requests', 'friends']})
    })
}

const useGetFriendRequests = (author: AuthorOutput) => (
    useQuery({
        queryKey: ['friend-requests'],
        queryFn: async () => {
            const { data } = await axios.get<FriendshipOutput[]>(`${author.id}/requests`, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: getAuthorizationHeader(author.host),
                },
              });
            return data
        },
        refetchInterval: REFRESH_INTERVAL,
    })
)


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

export {
    useGetFriends,
    useSendFriendRequest,
    useGetFriendRequests,
    useRejectFriendRequest,
    useAcceptFriendRequest
}