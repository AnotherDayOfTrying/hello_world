CMPUT404-project-socialdistribution
===================================

CMPUT 404 Project: Social Distribution

[Project requirements](https://github.com/uofa-cmput404/project-socialdistribution/blob/master/project.org) 


![NodeJS](https://img.shields.io/badge/node.js-v18.x.x-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/python-v3.6+-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![DjangoREST](https://img.shields.io/badge/DJANGO-REST-ff1709?style=for-the-badge&logo=django&logoColor=white&color=ff1709&labelColor=gray)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)



<p align="center">
<a href="https://cmput404-project-frontend-31e44b042044.herokuapp.com/">
<img height="100px" width="100px" src="./frontend/hello-world-project/public/favicon.svg" />
</a>
</p>

<div align="center">
    <span>
        <a href="https://cmput404-project-frontend-31e44b042044.herokuapp.com/">
        <img alt="Static Badge" src="https://img.shields.io/badge/OPEN%20APP-%23430098.svg?style=for-the-badge&logo=heroku&logoColor=white"/>
        </a>
    </span>
    <span>
        <a href="https://cmput404-project-backend-a299a47993fd.herokuapp.com/">
        <img alt="Static Badge" src="https://img.shields.io/badge/API%20DOCS-grey?style=for-the-badge&logo=swagger">
        </a>
    </span>
</div>



Local Development
===================

**Requirements**
| Language | Version |
| --- | --- |
| Python | v3.6+ |
| Node | v18.x.x |

**Django**
1. Navigate to `backend`
2. Create virtual environment: `virtualenv venv`
3. Start virtual environment: `./venv/Scripts/activate`
4. Install python packages: `pip install -r requirements.txt`
5. Navigate to `hello_world_rest_api`
5. Run local server: `python .\manage.py runserver --settings=hello_world_rest_api.local_settings`


**React**
1. Navigate to `frontend/hello-world-project`
2. Install node packages: `npm i`
3. Run locally: `npm run start`

Contributors / Licensing
========================

Authors:

* Marafi Mergani
* Charles Perez
* Justin Javier
* Sam Lu
* Saif Husnain

Generally everything is LICENSE'D under Apache 2.0.


User Stories:
- [x] As an author I want to make public posts.
- [x] As an author I want to edit public posts.
- [x] As an author, posts I create can link to images.
- [x] As an author, posts I create can be images.
- [x] As a server admin, images can be hosted on my server.
- [x] As an author, posts I create can be private to another author
- [x] As an author, posts I create can be private to my friends
- [x] As an author, I can share other author’s public posts
- [x] As an author, I can re-share other author’s friend posts to my friends
- [x] As an author, posts I make can be in simple plain text
- [x] As an author, posts I make can be in CommonMark
- [x] As an author, I want a consistent identity per server
- [x] As a server admin, I want to host multiple authors on my server
- [x] As a server admin, I want to share public images with users on other servers.
- [x] As an author, I want to pull in my github activity to my “stream”
- [x] As an author, I want to post posts to my “stream”
- [x] As an author, I want to delete my own public posts.
- [x] As an author, I want to befriend local authors
- [x] As an author, I want to befriend remote authors
- [x] As an author, I want to feel safe about sharing images and posts with my friends – images shared to friends should only be visible to friends. [public images are public]
- [x] As an author, when someone sends me a friends only-post I want to see the likes.
- [x] As an author, comments on friend posts are private only to me the original author.
- [x] As an author, I want un-befriend local and remote authors
- [x] As an author, I want to be able to use my web-browser to manage my profile
- [x] As an author, I want to be able to use my web-browser to manage/author my posts
- [x] As a server admin, I want to be able add, modify, and remove authors.
- [x] As a server admin, I want to OPTIONALLY be able allow users to sign up but require my OK to finally be on my server
- [x] As a server admin, I don’t want to do heavy setup to get the posts of my author’s friends.
- [x] As a server admin, I want a restful interface for most operations
- [x] As an author, other authors cannot modify my public post
- [x] As an author, other authors cannot modify my shared to friends post.
- [x] As an author, I want to comment on posts that I can access
- [x] As an author, I want to like posts that I can access
- [x] As an author, my server will know about my friends
- [x] As an author, When I befriend someone (they accept my friend request) I follow them, only when the other author befriends me do I count as a real friend – a bi-directional follow is a true friend.
- [x] As an author, I want to know if I have friend requests.
- [x] As an author I should be able to browse the public posts of everyone
- [x] As a server admin, I want to be able to add nodes to share with
- [x] As a server admin, I want to be able to remove nodes and stop sharing with them.
- [x] As a server admin, I can limit nodes connecting to me via authentication.
- [x] As a server admin, node to node connections can be authenticated with HTTP Basic Auth
- [x] As a server admin, I can disable the node to node interfaces for connections that are not authenticated!
- [x] As an author, I want to be able to make posts that are unlisted, that are publicly shareable by URI alone (or for embedding images)
