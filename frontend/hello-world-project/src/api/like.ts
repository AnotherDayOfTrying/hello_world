import axios from 'axios'
import APIURL, {getAuthorizationHeader} from './config'
import { enqueueSnackbar } from 'notistack';
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

const likeObjectAsync = async (author: AuthorOutput, likeInput: LikeInput): Promise<LikeOutput | undefined> => {

    try {
        const { data } = await axios.post<LikeOutput>(`${author.id}/inbox`, likeInput, {
            headers: {
                Authorization: getAuthorizationHeader(author.host),
            }
        })
        return data
    } catch {
        // enqueueSnackbar('Unable to Like Post', {variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' }})
        return undefined
    }
}

const useLikeObject = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args: {author: AuthorOutput, likeInput: LikeInput}) => {
            const {author, likeInput}
        }
    })
}

const useGetAuthorsLiked = (author: AuthorOutput) => (
    useQuery({
        queryKey: ['liked', author.id],
        queryFn: async () => {
            const { data } = await axios.get<LikeListOutput>(`${author.id}/liked`, {
                headers: {
                    Authorization: getAuthorizationHeader(author.host),
                }
            })
            return data;
        }
    })
)

export {likeObjectAsync, useGetAuthorsLiked}