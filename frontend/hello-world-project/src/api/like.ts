import axios from 'axios'
import {getAuthorizationHeader} from './config'
import { AuthorInput, AuthorOutput } from './author';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


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

const useLikeObject = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {author: AuthorOutput, likeInput: LikeInput}) => {
            const {author, likeInput} = args

            const { data } = await axios.post<LikeOutput>(`${author.id}/inbox/`, likeInput, {
                headers: {
                    Authorization: getAuthorizationHeader(author.host),
                }
            })
            return data
        },
        onSuccess: () => {queryClient.invalidateQueries({queryKey: ['liked']})}
    })
}

const useGetAuthorsLiked = (author: AuthorOutput) => (
    useQuery({
        queryKey: ['liked', author.id],
        queryFn: async () => {
            const { data } = await axios.get<LikeListOutput>(`${author.id}/liked/`, {
                headers: {
                    Authorization: getAuthorizationHeader(author.host),
                }
            })
            return data;
        }
    })
)

export {useLikeObject, useGetAuthorsLiked}