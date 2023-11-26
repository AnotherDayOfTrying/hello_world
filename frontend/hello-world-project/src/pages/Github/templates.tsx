const templates = {
    Stream: '<div class="gha-feed">{{{text}}}<div class="gha-push-small"></div>{{{footer}}}</div>',
  Activity: '<div id="{{id}}" class="gha-activity">\
               <div class="gha-activity-icon"><span class="octicon mega-octicon octicon-{{icon}}"></span></div>\
               <div class="gha-message"><div class="gha-time">{{{timeString}}}</div>{{{userLink}}} {{{message}}}</div>\
               <div class="gha-clear"></div>\
             </div>',
  SingleLineActivity: '<div class="gha-activity gha-small">\
                         <div class="gha-activity-icon"><span class="octicon octicon-{{icon}}"></span></div>\
                         <div class="gha-message"><div class="gha-time">{{{timeString}}}</div>{{{userLink}}} {{{message}}}</div>\
                         <div class="gha-clear"></div>\
                       </div>',
  UserHeader: '<div class="gha-header">\
                 <div class="gha-github-icon"><span class="octicon octicon-mark-github"></span></div>\
                 <div class="gha-user-info{{withoutName}}">{{{userNameLink}}}<p>{{{userLink}}}</p></div>\
                 <div class="gha-gravatar">{{{gravatarLink}}}</div>\
               </div><div class="gha-push"></div>',
  Footer: '<div class="gha-footer">Public Activity <a href="https://github.com/caseyscarborough/github-activity" target="_blank">GitHub Activity Stream</a>',
  NoActivity: '<div class="gha-info">This user does not have any recent public activity.</div>',
  UserNotFound: '<div class="gha-info">User {{username}} wasn\'t found.</div>',
  EventsNotFound: '<div class="gha-info">Events for user {{username}} not found.</div>',
  CommitCommentEvent: 'commented on commit {{{commentLink}}}<br>{{{userGravatar}}}<small>{{comment}}</small>',
  CreateEvent: 'created {{payload.ref_type}} {{{branchLink}}}{{{repoLink}}}',
  DeleteEvent: 'deleted {{payload.ref_type}} {{payload.ref}} at {{{repoLink}}}',
  FollowEvent: 'started following {{{targetLink}}}',
  ForkEvent: 'forked {{{repoLink}}} to {{{forkLink}}}',
  GistEvent: '{{actionType}} {{{gistLink}}}',
  GollumEvent: '{{actionType}} the {{{repoLink}}} wiki<br>{{{userGravatar}}}<small>{{{message}}}</small>',
  IssueCommentEvent: 'commented on {{issueType}} {{{issueLink}}}<br>{{{userGravatar}}}<small>{{comment}}</small>',
  IssuesEvent: '{{payload.action}} issue {{{issueLink}}}<br>{{{userGravatar}}}<small>{{payload.issue.title}}</small>',
  MemberEvent: 'added {{{memberLink}}} to {{{repoLink}}}',
  PublicEvent: 'open sourced {{{repoLink}}}',
  PullRequestEvent: '{{eventType}} pull request {{{pullRequestLink}}}<br>{{{userGravatar}}}<small>{{payload.pull_request.title}}</small>{{{mergeMessage}}}',
  PullRequestReviewEvent: '{{eventType}} pull request {{{pullRequestLink}}}.<br>{{{userGravatar}}}<small>{{payload.review.body}}</small>',
  PullRequestReviewCommentEvent: 'commented on pull request {{{pullRequestLink}}}<br>{{{userGravatar}}}<small>{{comment}}</small>',
  PushEvent: 'pushed to {{{branchLink}}}{{{repoLink}}}<br>\
                <ul class="gha-commits">{{#payload.commits}}{{/payload.commits}}</ul>\
                <small class="gha-message-commits">{{{commitsMessage}}}</small>',
    ReleaseEvent: 'released {{{tagLink}}} at {{{repoLink}}}<br>{{{userGravatar}}}<small><span class="octicon octicon-cloud-download"></span>  {{{zipLink}}}</small>',
  WatchEvent: 'starred {{{repoLink}}}'
  };
  
  export default templates;
  