import axios, { AxiosError } from 'axios'
import APIURL, {getAuthorizationHeader} from './config'
import { enqueueSnackbar } from 'notistack';
import { AuthorInput, AuthorOutput } from './author';

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
    object: string,
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
const getInbox = async (authorId: string) => {
    const { data } = await axios.get<InboxOutput>(`${authorId}/inbox`, {
        headers: {
            Authorization: getAuthorizationHeader()
        }
    })
    return data;
}

const getPublicPostsAsync = async (authorId: string) => {
    try {
        const { items: posts } = await getInbox(authorId)
        return posts.filter(({visibility, unlisted}) => visibility == 'PUBLIC' && !unlisted)
    } catch {
        enqueueSnackbar('Unable to Fetch PUBLIC Posts', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        return undefined
    }
}

const getPrivatePostsAsync = async (authorId: string) => {
    try {
        const { items: posts } = await getInbox(authorId)
        return posts.filter(({visibility, unlisted}) => visibility == 'FRIENDS' && !unlisted)
    } catch {
        enqueueSnackbar('Unable to Fetch PRIVATE Posts', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } })
        return undefined
    }
}

const getUnlistedPostsAsync = async (authorId: string) => {
    try {
        const { items: posts } = await getInbox(authorId)
        return posts.filter(({unlisted}) => unlisted)
    } catch {
        enqueueSnackbar('Unable to Fetch UNLISTED Posts', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        return undefined
    }
}

const getAuthorsPostsAsync = async (authorId: string): Promise<PostListOutput | undefined> => {
    try {
        const { data } = await axios.get<PostListOutput>(`${authorId}/posts/`, {
            headers: {
                Authorization: getAuthorizationHeader(),
            }
        })
        return data
    } catch {
        enqueueSnackbar('Unable to Fetch Author\'s Posts', {variant: 'error'})
        return undefined
    }
}


const createPostAsync = async (authorId: string, postInput: PostInput): Promise<PostOutput | undefined> => {
    try {
        const { data } = await axios.post<PostOutput>(`${authorId}/posts/`, postInput, {
            headers: {
                Authorization: getAuthorizationHeader(),
            }
        })
        enqueueSnackbar('Post Uploaded Successfully', {variant: 'success', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }});
        return data
    } catch {
        enqueueSnackbar('Unable to Create Post', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }});
        return undefined
    }
}

const editPostAsync = async (postId: string, postInput: PostInput) => {
    try {
        await axios.post(`${postId}/`, postInput, { //trailing slash is required
            headers: {
                Authorization: getAuthorizationHeader()
            }
        })
        enqueueSnackbar('Post Edited Successfully', {variant: 'success'});
    } catch {
        enqueueSnackbar('Unable to Edit Post', {variant: 'error'})
    }
}

const deletePostAsync = async (postId: string) => {
    try {
        await axios.delete(`${postId}/`, { //trailing slash is required
            headers: {
                Authorization: getAuthorizationHeader(),
            },
        });
    } catch {
        enqueueSnackbar('Unable to Delete Post', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
    }
}

const sendPostAsync = async (authorId: string, sendPostInput: SendPostInput): Promise<SendPostOutput | undefined> => {
    try {
        const { data } = await axios.post<SendPostOutput>(`${authorId}/inbox`, sendPostInput, {
            headers: {
                Authorization: getAuthorizationHeader(),
            }
        });
        return data
    } catch {
        enqueueSnackbar(`Unable to Send Post to ${authorId}`, {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        return undefined
    }
}

const getPostImageAsync = async (postId: string) => {
    try {
        const { data } = await axios.get<ImageOutput>(`${postId}/image`, {
            headers: {
                Authorization: getAuthorizationHeader()
            }
        });
        return data
    } catch (e) {
        if (e instanceof AxiosError && e.response?.status !== 404) {
            enqueueSnackbar('Unable to fetch Image', {variant: 'error'})
        }
    }
}

const likeObjectsAsync = async (postId: string) => {
    try {
        const { data } = await axios.get(`${postId}/likes`,{
            headers: {
                Authorization: getAuthorizationHeader(),
            }
        })
        const formattedData = data.map((like: any) => ({ actor: like.author }));
        return formattedData
    } catch {
        enqueueSnackbar('Unable to fetch likes', {variant: 'error'})
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
        enqueueSnackbar('Unable to upload image', {variant: 'error'})
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
        enqueueSnackbar('Unable to delete image', {variant: 'error'})
        return undefined
    }
}

export {
    createPostAsync,
    getAuthorsPostsAsync,
    getPublicPostsAsync,
    getPrivatePostsAsync,
    getUnlistedPostsAsync,
    deletePostAsync,
    sendPostAsync,
    editPostAsync,
    createPostImageAsync,
    deletePostImageAsync,
    getPostImageAsync,
    likeObjectsAsync,
}