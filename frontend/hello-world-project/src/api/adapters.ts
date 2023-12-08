import { FriendshipInput } from "./friend";


export interface WebWizardsFriendshipInput {
    type: 'Follow',
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

export interface MonkeyFriendshipInput {
    type: 'Follow',
    summary: string,
    actor: {
        type: 'author',
        id: string,
        host: string,
        displayName: string,
        url: string,
        github: string,
        profileImage: string,
    },
    object: {
        type: 'author',
        id: string,
        host: string,
        displayName: string,
        url: string,
        github: string,
        profileImage: string,
    }
}

enum HOST {
    WEB_WIZARDS = 'https://webwizards-backend-952a98ea6ec2.herokuapp.com/service/',
    CODE_MONKEYS = 'https://chimp-chat-1e0cca1cc8ce.herokuapp.com/'
}

export const friendRequestAdapter = (host: string, input: FriendshipInput) => {
    if (host === HOST.WEB_WIZARDS) {
        const adaptedRequest: WebWizardsFriendshipInput = {
            type: 'Follow',
            actor: {
                type: 'author',
                displayName: input.actor.displayName,
                server_host: input.actor.host,
                url: input.actor.url,
                github_link: input.actor.github || 'https://github.com/AnotherDayOfTrying'
            },
            object: {
                type: 'author',
                displayName: input.object.displayName,
                server_host: input.object.host,
                url: input.object.url,
                github_link: input.object.github || 'https://github.com/AnotherDayOfTrying'
            }
        }
        return adaptedRequest
    } else if (host === HOST.CODE_MONKEYS) {
        const adaptedRequest: MonkeyFriendshipInput = {
            type: 'Follow',
            summary: input.summary,
            actor: {
                type: 'author',
                id: input.actor.id,
                host: input.actor.host,
                displayName: input.actor.displayName,
                url: input.actor.url,
                github: input.actor.github || 'https://github.com/AnotherDayOfTrying',
                profileImage: input.actor.profileImage
            },
            object: {
                type: 'author',
                id: input.object.id,
                host: input.object.host,
                displayName: input.object.displayName,
                url: input.object.url,
                github: input.object.github || 'https://github.com/AnotherDayOfTrying',
                profileImage: input.object.profileImage
            }
        }
        return adaptedRequest
    } else {
        return input
    }
}