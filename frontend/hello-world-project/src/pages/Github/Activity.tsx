import React from 'react';
import './activity.css';
import templates from './templates'; 
import icons from './icons'; 

interface UserActivityProps {
  activity: any;
}

const UserActivity: React.FC<UserActivityProps> = ({ activity }) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const renderCommits = () => {
    const commits = activity.payload.commits;

  if (commits && commits.length > 0) {
    const displayedCommits = commits.slice(0, 3);
    return displayedCommits.map((commit: any) => ({
        committerGravatar: `<img src="${activity.actor.avatar_url}" alt="User Avatar" class="gha-gravatar-image" />`,
        shaLink: `<a href="https://github.com/${activity.repo?.name}/commit/${commit.sha}" class="custom-link">${commit.sha.substring(0, 6)}</a>`,
        message: commit.message,
      }));
    }
  
    return [];
  };

  const renderFooter = () => {
    return templates.Footer;
  };

const getBranchLink = (ref: string, repoName: string) => {
    if (ref && repoName) {
        const branch = ref.split('/')
        const branchName = branch[branch.length - 1]
        return `<a href="https://github.com/${repoName}/tree/${branchName}" class="custom-link">${branchName}</a>`
    }
    return ''
    }
    

const renderActivity = () => {
    const template = templates[activity.type as keyof typeof templates];

    
    if (template) {
        return template
        .replace('{{{branchLink}}}', getBranchLink(activity.payload.ref, activity.repo?.name) + ' at ')
        .replace('{{icon}}', icons[activity.type as keyof typeof icons] as string)
        .replace('{{{timeString}}}', formatDate(activity.created_at))
        .replace('{{{userLink}}}', `<a href="${activity.actor.url}" class="custom-link">${activity.actor.display_login}</a>`)
        .replace('{{{footer}}}', renderFooter())
        .replace('{{id}}', activity.id)
        .replace('{{{commentLink}}}', activity.payload.commits && activity.payload.commits[0]?.url)
        .replace('{{{userGravatar}}}', `<img src="${activity.actor.avatar_url}" alt="User Avatar" class="gha-gravatar-image" />`)
        .replace('{{comment}}', activity.payload.commits && activity.payload.commits[0]?.message)
        .replace('{{payload.ref}}', activity.payload.ref)
        .replace('{{payload.ref_type}}', activity.payload.ref_type)
        .replace('{{payload.pull_request.title}}', activity.payload.pull_request?.title)
        .replace('{{#payload.commits}}', renderCommits().slice(0, 3).map((commit: any) => `<li><small>${commit.committerGravatar} ${commit.shaLink} ${commit.message}</small></li>`).join(''))
        .replace('{{/payload.commits}}', '')
        .replace('{{{commitsMessage}}}', activity.payload.commits && activity.payload.commits.length > 0 ? `with ${activity.payload.commits.length} commit(s)` : '')
        .replace('{{{repoLink}}}', `<a href="https://github.com/${activity.repo.name}" class="custom-link">${activity.repo?.name}</a>`)
        .replace('{{{targetLink}}}', `<a href="${activity.payload.target?.url}" class="custom-link">${activity.payload.target?.login}</a>`)
        .replace('{{{forkLink}}}', `<a href="${activity.payload.forkee?.html_url}" class="custom-link">${activity.payload.forkee?.full_name}</a>`)
        .replace('{{actionType}}', activity.payload.action)
        .replace('{{{gistLink}}}', `<a href="${activity.payload.gist?.html_url}" class="custom-link">${activity.payload.gist?.description}</a>`)
        .replace('{{issueType}}', activity.payload.issue?.pull_request ? 'pull request' : 'issue')
        .replace('{{{issueLink}}}', `<a href="${activity.payload.issue?.html_url}" class="custom-link">${activity.payload.issue?.title}</a>`)
        .replace('{{{memberLink}}}', `<a href="${activity.payload.member?.html_url}" class="custom-link">${activity.payload.member?.login}</a>`)
        .replace('{{eventType}}', activity.payload.action)
        .replace('{{{pullRequestLink}}}', `<a href="${activity.payload.pull_request?.html_url}" class="custom-link">${activity.payload.pull_request?.title}</a>`)
        .replace('{{{mergeMessage}}}', activity.payload.pull_request?.merged ? ' (merged)' : '')
        .replace('{{{tagLink}}}', `<a href="${activity.payload.release?.html_url}" class="custom-link">${activity.payload.release?.tag_name}</a>`)
        .replace('{{{zipLink}}}', `<a href="${activity.payload.release?.zipball_url}" class="custom-link">Download</a>`)
        .replace('{{payload.review.body}}', activity.payload.review?.body);
    }
    return 'No template found for this event type';
};

  return (
    <div className="activitycard" dangerouslySetInnerHTML={{ __html: renderActivity() }} />
  );
};

export default UserActivity;
