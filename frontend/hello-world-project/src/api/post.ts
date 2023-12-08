import axios, { AxiosError } from 'axios'
import { REFRESH_INTERVAL, getAuthorizationHeader} from './config'
import { enqueueSnackbar } from 'notistack';
import { AuthorInput, AuthorOutput } from './author';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LikeOutput } from './like';

type VISIBILITY = 'PUBLIC' | 'FRIENDS'
export type CONTENT_TYPE = 'text/plain' | 'text/markdown' | 'application/base64' | 'image/png' | 'image/jpeg'

export interface PostInput {
    title: string,
    author: AuthorInput,
    description: string,
    contentType: CONTENT_TYPE,
    content: string,
    categories: string,
    visibility: VISIBILITY,
    unlisted: boolean,
}

export interface PostOutput {
    type: "post",
    title: string,
    id: string,
    source: string,
    origin: string,
    description: string,
    contentType: CONTENT_TYPE,
    content: string,
    author: AuthorOutput,
    categories: string,
    count: number,
    comments: string,
    published: string,
    visibility: VISIBILITY,
    unlisted: boolean,
}

export interface PostListOutput {
    type: 'posts',
    items: PostOutput[],
}

export interface InboxOutput {
    type: 'inbox',
    author: string,
    items: PostOutput[],
}

export interface SendPostInput {
    type: 'post',
    author: AuthorInput,
    id: string,
}

export interface SendPostOutput {

}

export interface ImageInput {
    image: Blob
}

export interface ImageOutput {
    image_url: string
}

// Do not use directly in react code
const getInbox = async (author: AuthorOutput) => {
    const { data } = await axios.get<InboxOutput>(`${author.id}/inbox/`, {
        headers: {
            Authorization: getAuthorizationHeader(author.host)
        }
    })
    return data;
}

const useGetPublicPosts = (author: AuthorOutput, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['public-posts', author.id],
        queryFn: async () => await getInbox(author),
        select: (data) => data.items.filter(({visibility, unlisted}) => visibility == 'PUBLIC' && !unlisted),
        refetchInterval: REFRESH_INTERVAL,
        enabled,
    })
}

const useGetPrivatePosts = (author: AuthorOutput, enabled: boolean = true) => (
    useQuery({
        queryKey: ['private-posts', author.id],
        queryFn: async () => await getInbox(author),
        select: (data) => data.items.filter(({visibility, unlisted}) => visibility == 'FRIENDS' && !unlisted),
        refetchInterval: REFRESH_INTERVAL,
        enabled
    })
)

const useGetUnlistedPosts = (author: AuthorOutput, enabled: boolean = true) => (
    useQuery({
        queryKey: ['unlisted-posts', author.id],
        queryFn: async () => await getInbox(author),
        select: (data) => data.items.filter(({unlisted}) => unlisted),
        refetchInterval: REFRESH_INTERVAL,
        enabled
    })
)


const useGetAuthorsPosts = (author: AuthorOutput, enabled: boolean = true) => (
    useQuery({
        queryKey: ['my-own-posts', author.id],
        queryFn: async () => {
            const { data } = await axios.get<PostListOutput>(`${author.id}/posts/`, {
                headers: {
                    Authorization: getAuthorizationHeader(author.host),
                }
            })
            return data
        },
        select: (data) => {return data.items},
        refetchInterval: REFRESH_INTERVAL,
        enabled
    })
)

const useCreatePost = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {author: AuthorOutput, postInput: PostInput}) => {
            const {author, postInput} = args;
            const { data } = await axios.post<PostOutput>(`${author.id}/posts/`, postInput, {
                headers: {
                    Authorization: getAuthorizationHeader(author.host),
                }
            })
            return data
        },
        onSuccess: () => {
            enqueueSnackbar('Post Created', {variant: 'success'})
            queryClient.invalidateQueries({ queryKey: ['my-own-posts', 'public-posts', 'private-posts', 'unlisted-posts'] })
        },
        onError: () => {
            enqueueSnackbar('Unable to Create Post', {variant: 'error'})
        }
    })
}

const useEditPost = (post?: PostOutput) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {post: PostOutput, postInput: PostInput}) => {
            const {post, postInput} = args;
            await axios.post(`${post.id}/`, postInput, { //trailing slash is required
                headers: {
                    Authorization: getAuthorizationHeader(post.author.host)
                }
            })
        },
        onSuccess: () => {
            enqueueSnackbar('Post Edited', {variant: 'success'})
            queryClient.invalidateQueries({queryKey: [post?.id]})
        },
        onError: () => {
            enqueueSnackbar('Unable to Edit Post', {variant: 'error'})
        }
    })
}

const useDeletePost = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (postId: string) => {
            await axios.delete(`${postId}/`, { //trailing slash is required
                headers: {
                    Authorization: getAuthorizationHeader(), // can only delete posts local
                },
            });
        },
        onSuccess: () => {
            enqueueSnackbar('Post Deleted', {variant: 'success'})
            queryClient.invalidateQueries({ queryKey: ['my-own-posts', 'public-posts', 'private-posts', 'unlisted-posts'] })
        },
        onError: () => {
            enqueueSnackbar('Unable to Delete Post', {variant: 'error'})
        }
    })
}

const useSendPost = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {author: AuthorOutput, sendPostInput: SendPostInput}) => {
            const {author, sendPostInput} = args;
            const { data } = await axios.post<SendPostOutput>(`${author.id}/inbox/`, sendPostInput, {
                headers: {
                    Authorization: getAuthorizationHeader(author.host),
                }
            });
            return data
        },
        onSuccess: () => {queryClient.invalidateQueries({ queryKey: ['my-own-posts', 'public-posts', 'private-posts', 'unlisted-posts'] })}
    })
}

const useGetLikeObjects = (post: PostOutput) => (
    useQuery({
        queryKey: ['likes', post.id],
        queryFn: async () => {
            const { data } = await axios.get<LikeOutput[]>(`${post.id}/likes/`,{
                headers: {
                    Authorization: getAuthorizationHeader(post.author.host),
                }
            })
            return data
        },
        refetchInterval: REFRESH_INTERVAL,
    })
)

const useGetPostImage = (post: PostOutput, enabled: boolean = true) => (
    useQuery({
        queryKey: ['post-image', post.id],
        queryFn: async () => {
            const { data } = await axios.get<ImageOutput>(`${post.id}/image/`, {
                headers: {
                    Authorization: getAuthorizationHeader(post.author.host)
                }
            });
            return data
        },
        enabled: enabled
    })
)

const useCreatePostImage = (post?: PostOutput) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {post: PostOutput, imageInput: ImageInput}) => {
            const {post, imageInput} = args
            const formData = new FormData()
            formData.append('image', imageInput.image)
            const { data } = await axios.post<ImageOutput>(`${post.id}/image/`, formData, {
                headers: {
                    Authorization: getAuthorizationHeader(post.author.host),
                    "Content-Type": 'multipart/form-data'
                }
            })
            return data
        },
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['post-image', post?.id]})
    })
}

const useDeletePostImage = (post?: PostOutput) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (post: PostOutput) => {
            const { data } = await axios.delete(`${post.id}/image/`, {
                headers: {
                    Authorization: getAuthorizationHeader(post.author.host),
                }
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['post-image', post?.id]})
        }
    })
}

export {
    useCreatePost,
    useGetAuthorsPosts,
    useGetPublicPosts,
    useGetPrivatePosts,
    useGetUnlistedPosts,
    useDeletePost,
    useGetLikeObjects,
    useSendPost,
    useEditPost,
    useGetPostImage,
    useCreatePostImage,
    useDeletePostImage,
}