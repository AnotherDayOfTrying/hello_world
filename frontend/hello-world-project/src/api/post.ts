import axios, { AxiosError } from 'axios'
import APIURL, {getAuthorizationHeader} from './config'
import { enqueueSnackbar } from 'notistack';
import { AuthorInput, AuthorOutput } from './author';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type VISIBILITY = 'PUBLIC' | 'FRIENDS'
type CONTENT_TYPE = 'text/plain' | 'text/markdown' | 'application/base64' | 'image/png' | 'image/jpeg'

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
    const { data } = await axios.get<InboxOutput>(`${author.id}/inbox`, {
        headers: {
            Authorization: getAuthorizationHeader(author.host)
        }
    })
    return data;
}


// const getPosts = (author: AuthorOutput) => (
//     useQuery({
//         queryKey: ['posts', author.id],
//         queryFn: async () => {
//             const { data } = await axios.get<InboxOutput>(`${APIURL}/posts/`, {
//                 headers: {
//                     Authorization: getAuthorizationHeader(author.host)
//                 }
//             })
//             return data;
//         }
//     })
// )

// const getPosts = async (author: AuthorOutput) => {
//     const { data } = await axios.get<InboxOutput>(`${APIURL}/posts/`, {
//         headers: {
//             Authorization: getAuthorizationHeader(author.host)
//         }
//     })
//     return data;
// }

const useGetPublicPosts = (author: AuthorOutput) => (
    useQuery({
        queryKey: ['public-posts', author.id],
        queryFn: async () => await getInbox(author),
        select: (data) => data.items.filter(({visibility, unlisted}) => visibility == 'PUBLIC' && !unlisted),
        refetchInterval: 3000
    })
)
    // try {
    //     const { items: posts } = await getInbox(author)
    //     return posts.filter(({visibility, unlisted}) => visibility == 'PUBLIC' && !unlisted)
    // } catch {
    //     // enqueueSnackbar('Unable to Fetch PUBLIC Posts', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
    //     return undefined
    // }

const useGetPrivatePosts = (author: AuthorOutput) => (
    useQuery({
        queryKey: ['private-posts', author.id],
        queryFn: async () => await getInbox(author),
        select: (data) => data.items.filter(({visibility, unlisted}) => visibility == 'FRIENDS' && !unlisted),
        refetchInterval: 3000
    })
)
    // try {
    //     const { items: posts } = await getInbox(author)
    //     return posts.filter(({visibility, unlisted}) => visibility == 'FRIENDS' && !unlisted)
    // } catch {
    //     // enqueueSnackbar('Unable to Fetch PRIVATE Posts', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } })
    //     return undefined
    // }

const useGetUnlistedPosts = (author: AuthorOutput) => (
    useQuery({
        queryKey: ['unlisted-posts', author.id],
        queryFn: async () => await getInbox(author),
        select: (data) => data.items.filter(({unlisted}) => unlisted),
        refetchInterval: 3000,
    })
)
    // try {
    //     const { items: posts } = await getInbox(author)
    //     return posts.filter(({unlisted}) => unlisted)
    // } catch {
    //     // enqueueSnackbar('Unable to Fetch UNLISTED Posts', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
    //     return undefined
    // }


const useGetAuthorsPosts = (author: AuthorOutput) => (
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
        refetchInterval: 3000
    })
)
    // try {
    //     const { data } = await axios.get<PostListOutput>(`${author.id}/posts/`, {
    //         headers: {
    //             Authorization: getAuthorizationHeader(),
    //         }
    //     })
    //     return data
    // } catch {
    //     // enqueueSnackbar('Unable to Fetch Author\'s Posts', {variant: 'error'})
    //     return undefined
    // }



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
            queryClient.invalidateQueries({ queryKey: ['my-own-posts', 'public-posts', 'private-posts', 'unlisted-posts'] })
        }
    })
}

// const createPostAsync = async (authorId: string, postInput: PostInput): Promise<PostOutput | undefined> => {
//     try {
//         const { data } = await axios.post<PostOutput>(`${authorId}/posts/`, postInput, {
//             headers: {
//                 Authorization: getAuthorizationHeader(),
//             }
//         })
//         enqueueSnackbar('Post Uploaded Successfully', {variant: 'success', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }});
//         return data
//     } catch {
//         // enqueueSnackbar('Unable to Create Post', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }});
//         return undefined
//     }
// }

const editPostAsync = async (postId: string, postInput: PostInput) => {
    try {
        await axios.post(`${postId}/`, postInput, { //trailing slash is required
            headers: {
                Authorization: getAuthorizationHeader()
            }
        })
        enqueueSnackbar('Post Edited Successfully', {variant: 'success'});
    } catch {
        // enqueueSnackbar('Unable to Edit Post', {variant: 'error'})
    }
}

const useDeletePost = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (postId: string) => {
            await axios.delete(`${postId}/`, { //trailing slash is required
                headers: {
                    Authorization: getAuthorizationHeader(),
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-own-posts', 'public-posts', 'private-posts', 'unlisted-posts'] })
        }
    })
}

// const deletePostAsync = async (postId: string) => {
//     try {
        
//     } catch {
//         // enqueueSnackbar('Unable to Delete Post', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
//     }
// }

const sendPostAsync = async (authorId: string, sendPostInput: SendPostInput): Promise<SendPostOutput | undefined> => {
    try {
        const { data } = await axios.post<SendPostOutput>(`${authorId}/inbox`, sendPostInput, {
            headers: {
                Authorization: getAuthorizationHeader(),
            }
        });
        return data
    } catch {
        // enqueueSnackbar(`Unable to Send Post to ${authorId}`, {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        return undefined
    }
}

const getPostImageAsync = async (post: PostOutput) => {
    try {
        const { data } = await axios.get<ImageOutput>(`${post.id}/image${post.author.host === 'https://distributed-network-37d054f03cf4.herokuapp.com/' ? '/': ''}`, {
            headers: {
                Authorization: getAuthorizationHeader(post.author.host)
            }
        });
        return data
    } catch (e) {
        if (e instanceof AxiosError && e.response?.status !== 404) {
            // enqueueSnackbar('Unable to fetch Image', {variant: 'error'})
        }
    }
}

const likeObjectsAsync = async (post: PostOutput) => {
    try {
        const { data } = await axios.get(`${post.id}/likes`,{
            headers: {
                Authorization: getAuthorizationHeader(post.author.host),
            }
        })
        const formattedData = data.map((like: any) => ({ actor: like.author }));
        return formattedData
    } catch {
        // enqueueSnackbar('Unable to fetch likes', {variant: 'error'})
        return undefined
    }
}


const createPostImageAsync = async (postId: string, imageInput: ImageInput): Promise<ImageOutput | undefined> => {
    try {
        const formData = new FormData()
        formData.append('image', imageInput.image)
        const { data } = await axios.post<ImageOutput>(`${postId}/image`, formData, {
            headers: {
                Authorization: getAuthorizationHeader(),
                "Content-Type": 'multipart/form-data'
            }
        })
        return data
    } catch {
        // enqueueSnackbar('Unable to upload image', {variant: 'error'})
        return undefined
    }
}

const deletePostImageAsync = async (postId: string) => {
    try {
        const { data } = await axios.delete(`${postId}/image`, {
            headers: {
                Authorization: getAuthorizationHeader(),
            }
        })
        return data
    } catch {
        // enqueueSnackbar('Unable to delete image', {variant: 'error'})
        return undefined
    }
}

export {
    useCreatePost,
    useGetAuthorsPosts,
    useGetPublicPosts,
    useGetPrivatePosts,
    useGetUnlistedPosts,
    useDeletePost,
    sendPostAsync,
    editPostAsync,
    createPostImageAsync,
    deletePostImageAsync,
    getPostImageAsync,
    likeObjectsAsync,
    // getPosts
}