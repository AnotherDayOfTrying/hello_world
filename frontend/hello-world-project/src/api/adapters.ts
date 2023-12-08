import { FriendshipInput } from "./friend";


export interface WebWizardsFriendshipInput {
    actor: {
        type: 'author' | 'server_admin' | 'node',
        displayName: string,
        server_host: string,
        url: string,
        github_link: string,
    },
    object: {
        type: 'author' | 'server_admin' | 'node',
        displayName: string,
        server_host: string,
        url: string,
        github_link: string,
    }
}

export interface WebWizardsLikeInput {
    context?: string,
    summary: string,
    author: {
        type: 'author' | 'server_admin' | 'node',
        displayName: string,
        server_host: string,
        url: string,
        github_link: string,
    },
    object: string,
    '@context'?: string,
}

export interface WebWizardsSendPostInput {
    type: 'post',
    title: string,
    source: string,
    origin: string,
    contentType: 'text/markdown' | 'text/plain' | 'Image' | 'HTML' | 'URL/Link',
    content: string,
    visibility: 'FRIENDS' | 'PUBLIC',
    unlisted: boolean,
}

enum HOST {
    WEB_WIZARDS = 'https://webwizards-backend-952a98ea6ec2.herokuapp.com/service/'
}

export const friendRequestAdapter = (host: string, friendRequestInput: FriendshipInput) => {
    if (host === HOST.WEB_WIZARDS) {
        const adaptedRequest: WebWizardsFriendshipInput = {
            actor: {
                type: 'author',
                displayName: friendRequestInput.actor.displayName,
                server_host: friendRequestInput.actor.host,
                url: friendRequestInput.actor.url,
                github_link: friendRequestInput.actor.github || 'https://github.com/AnotherDayOfTrying'
            },
            object: {
                type: 'author',
                displayName: friendRequestInput.object.displayName,
                server_host: friendRequestInput.object.host,
                url: friendRequestInput.object.url,
                github_link: friendRequestInput.object.github || 'https://github.com/AnotherDayOfTrying'
            }
        }
    } else {
        return friendRequestInput
    }
}