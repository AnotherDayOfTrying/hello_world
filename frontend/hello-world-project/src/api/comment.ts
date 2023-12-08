import axios, { AxiosError } from 'axios'
import { REFRESH_INTERVAL, getAuthorizationHeader } from './config'
import { AuthorInput, AuthorOutput } from './author';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PostOutput } from './post';
import { enqueueSnackbar } from 'notistack';

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

const useGetComments = (post: PostOutput) => (
    useQuery({
        queryKey: ['comments', post.id],
        queryFn: async () => {
            const { data } = await axios.get<CommentListOutput>(post.comments, {
                headers: {
                    Authorization: getAuthorizationHeader(post.author.host)
                }
            })
            return data
        },
        refetchInterval: REFRESH_INTERVAL
    })
)

const useCreateComment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {post: PostOutput, commentInput: CommentInput}) => {
            const {post, commentInput} = args;
            const { data } = await axios.post<CommentOutput>(`${post.comments}`, commentInput, {
                headers: {
                    Authorization: getAuthorizationHeader(post.author.host)
                }
            });
            return data
        },
        onSuccess: () => {
            enqueueSnackbar('Created Comment', {variant: 'success'})
            queryClient.invalidateQueries({queryKey: ['comments']})
        },
        onError: () => {
            enqueueSnackbar('Unable to Create Comment', {variant: 'error'})
        },
        throwOnError: false
    })
}

export { useCreateComment, useGetComments }