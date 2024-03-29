import axios from 'axios'
import {REFRESH_INTERVAL, getAuthorizationHeader} from './config'
import { enqueueSnackbar } from 'notistack';
import { AuthorOutput } from './author';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { friendRequestAdapter } from './adapters';

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

export interface FollowerOutput {
    type: 'followers',
    items: AuthorOutput[]
}

const useSendFriendRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {author: AuthorOutput, sendFriendRequestInput: FriendshipInput}) => {
            const {author, sendFriendRequestInput} = args;
            const isBackslash = author.host !== 'https://webwizards-backend-952a98ea6ec2.herokuapp.com/service/'

            await axios.post(`${author.id}/inbox${isBackslash ? '/': ''}`, friendRequestAdapter(author.host, sendFriendRequestInput), {
                headers: {
                    Authorization: getAuthorizationHeader(author.host),
                }
            })
        },
        onSuccess: () => {
            enqueueSnackbar('Sent Friend Request', {variant: 'success'})
            queryClient.invalidateQueries({queryKey: ['friend-requests']})
        },
        onError: () => {
            enqueueSnackbar('Failed to Send Friend Request', {variant: 'error'})
        }
    })
}

const useAcceptFriendRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {author: AuthorOutput, actor: AuthorOutput}) => {
            const {author, actor} = args
            const actorId = actor.id.split('/').pop()
            await axios.put(`${author.id}/followers/${actorId}/`, {
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
        onSuccess: () => {
            enqueueSnackbar('Accepted Friend Request', {variant: 'success'})
            queryClient.invalidateQueries({queryKey: ['friend-requests', 'friends']})
        },
        onError: () => {
            enqueueSnackbar('Unable to Accept Friend Request', {variant: 'error'})
        },
        throwOnError: false,
    })
}

const useRejectFriendRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {author: AuthorOutput, actor: AuthorOutput}) => {
            const {author, actor} = args
            const actorId = actor.id.split('/').pop()
            const {data} = await axios.delete(`${author.id}/followers/${actorId}/`, {
                headers: {
                    Authorization: getAuthorizationHeader(author.host)
                }
            })
            return data
        },
        onSuccess: () => {
            enqueueSnackbar('Rejected Friend Request', {variant: 'success'})
            queryClient.invalidateQueries({queryKey: ['friend-requests', 'friends']})
        },
        onError: () => {
            enqueueSnackbar('Unable to Reject Friend Request', {variant: 'error'})
        },
    })
}

const useUnfriend = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {author: AuthorOutput, actor: AuthorOutput}) => {
            const {author, actor} = args
            const actorId = actor.id.split('/').pop();
            const { data } = await axios.delete(`${author.id}/followers/${actorId}/`,
            {
                headers: {
                'Content-Type': 'application/json',
                Authorization: getAuthorizationHeader(author.host),
                }
            });
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['friends']})
            enqueueSnackbar('Unfriended Successful', {variant: 'success'})
        },
        onError: () => {
            enqueueSnackbar('Unable to Unfriend', {variant: 'error'})
        }
    })
}

const useGetFriendRequests = (author: AuthorOutput) => (
    useQuery({
        queryKey: ['friend-requests'],
        queryFn: async () => {
            const { data } = await axios.get<FriendshipOutput[]>(`${author.id}/requests/`, {
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
            const { data } = await axios.get<FollowerOutput>(`${author.id}/followers/`, {
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
    useAcceptFriendRequest,
    useUnfriend,
}