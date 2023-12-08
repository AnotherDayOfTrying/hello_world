import os
from django.shortcuts import get_object_or_404
from .serializers import *
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from .models import *
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from rest_framework.pagination import PageNumberPagination
from .nodeAuthentication import NodesAuthentication
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from PIL import Image
from io import BytesIO
import base64
import requests
from requests.auth import HTTPBasicAuth
import random
from django.core.files.base import ContentFile
import re


# Create your views here.
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
@api_view(['GET'])
@authentication_classes([TokenAuthentication, NodesAuthentication])
@permission_classes([permissions.IsAuthenticated])
def getFollowers(request, author_id):
    author = get_object_or_404(Author,uid=author_id)
    followers = Friendship.objects.filter(object=author,status__in = [2,3])
    followers = followers.values_list('actor', flat=True)
    followers = Author.objects.filter(uid__in=followers)
    serializer = AuthorSerializer(followers, many=True, context={'request': request})
    response = {
        "type": "followers",
        "items": serializer.data,
    }
    return Response(response, status=status.HTTP_200_OK)
@api_view(['GET','POST'])
@authentication_classes([TokenAuthentication, NodesAuthentication])
@permission_classes([permissions.IsAuthenticated])
def getOneAuthor(request, author_id):
    
    if request.method == 'GET':
        author = get_object_or_404(Author,pk=author_id)
        serializer = AuthorSerializer(author, context={'request': request})       
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        author = Author.objects.filter(uid=author_id).first()
        if author:
            serializer = AuthorSerializer(instance=author, data=request.data,partial=True,context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            serializer = AuthorSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FriendshipView(generics.CreateAPIView):
    serializer_class = FriendShipSerializer
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request,author_id,foreign_author_id):
        author = get_object_or_404(Author,uid=author_id)
        foreign_author = get_object_or_404(Author,uid=foreign_author_id)
        friendship = Friendship.objects.filter(actor=foreign_author,object=author,status__in = [2,3])
        if friendship:
            return Response({'is_follower': True}, status=status.HTTP_200_OK)
        else:
            return Response({'is_follower': False}, status=status.HTTP_200_OK)
    def delete(self, request,author_id,foreign_author_id):
        author = get_object_or_404(Author,uid=author_id)
        foreign_author = get_object_or_404(Author,uid=foreign_author_id)
        friendship = get_object_or_404(Friendship,actor=foreign_author,object=author)
        reverse = Friendship.objects.filter(actor=author,object=foreign_author,status__in = [2,3]).first()
        if reverse and reverse.status == 3:
            reverse.status = 2
            reverse.save()
        friendship.delete()
        return Response({'message': 'Delete Success'}, status=status.HTTP_204_NO_CONTENT)
    def put(self,request,author_id,foreign_author_id):
        author = get_object_or_404(Author,uid=author_id)
        foreign_author = get_object_or_404(Author,uid=foreign_author_id)
        friendship = Friendship.objects.filter(actor=foreign_author,object=author).first()
        reverse = Friendship.objects.filter(actor=author,object=foreign_author,status__in = [2,3]).first()
        
        if friendship and friendship.status == 1:
            friendship.status = 2
            friendship.save()
            if reverse and reverse.status == 2:
                friendship.status = 3
                friendship.save()
                reverse.status = 3
                reverse.save()
            return Response({'message': 'Success'}, status=status.HTTP_200_OK)
        elif friendship and (friendship.status == 2 or friendship.status == 3):
            return Response({'message': 'Already Friends'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': 'No friend request has been sent'}, status=status.HTTP_404_NOT_FOUND)
class AllAuthorsView(generics.CreateAPIView):
    pagination_class = PageNumberPagination
    serializer_class = AuthorSerializer
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        page_number = request.query_params.get('page',1)
        page_size = request.query_params.get('page_size', self.pagination_class.page_size)
        try:
            page_number = int(page_number)
            page_size = int(page_size)
        except ValueError:
            return Response({'error': 'Invalid page or page_size parameter'}, status=400)
        
        queryset = Author.objects.filter(is_approved=True, is_a_node = False, is_superuser = False).order_by('uid')
        paginator = PageNumberPagination()
        paginator.page_size = page_size
        page = paginator.paginate_queryset(queryset,request)
        serializer = AuthorSerializer(page, many=True,context={'request': request})
        response = {
            "type": "authors",
            "items": serializer.data,
            'pagination': {
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link(),
                'page_number': page_number,
                'page_size': page_size,
            },
        }
        return Response(response, status=status.HTTP_200_OK)
class Signup(generics.CreateAPIView):
    
    serializer_class = SignUpSerializer

    def post(self,request):
        serializer = self.serializer_class(data = request.data)
        if serializer.is_valid():
            author = serializer.save()
            token, created = Token.objects.get_or_create(user=author)
            response = {
                'message': 'User created successfully',
                'token': token.key,
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class Signin(generics.CreateAPIView):
    
    serializer_class = SignInSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            author = serializer.validated_data['author']
            token, created = Token.objects.get_or_create(user=author)
            response = {
                'message': 'User logged in successfully',
                'token': token.key,
                'data': author.uid
            }
            return Response(response, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class PostView(generics.CreateAPIView):
    serializer_class = PostSerializer
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self,request,author_id,post_id):
        author = get_object_or_404(Author,uid=author_id)
        post = get_object_or_404(Post,uid=post_id)
        if post.visibility == 'PUBLIC':
            serializer = PostSerializer(post, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({'message': 'You have tried to access a private post'}, status=status.HTTP_403_FORBIDDEN)
    def delete(self,request,author_id,post_id):
        author = get_object_or_404(Author,uid=author_id)
        post = get_object_or_404(Post,uid=post_id)
        post.delete()
        return Response({'message': 'Delete Success'}, status=status.HTTP_204_NO_CONTENT)
    def put(self,request,author_id,post_id):
        author = get_object_or_404(Author,uid=author_id)
        post = Post.objects.filter(author=author,uid=post_id).first()
        if post:
            return Response({'message': 'There is already a post with that id'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def post(self,request,author_id,post_id):
        if (request.user.uid != author_id):
            return Response({'message': 'You are not the author of this post'}, status=status.HTTP_403_FORBIDDEN)
        author = get_object_or_404(Author,uid=author_id)
        post = get_object_or_404(Post,uid=post_id)
        serializer = PostSerializer(instance=post, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class InboxView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PostSerializer
        else:
            return PostImageSerializer # to allow input in swagger for testing
    
    def get(self, request, author_id):
        author = get_object_or_404(Author, uid=author_id)
        inbox_items = Inbox_Item.objects.filter(author=author)
        items = []
        for item in inbox_items:
            if isinstance(item.contentObject, Post):
                serializer = PostSerializer(item.contentObject, context={'request': request})
            # elif isinstance(item.item_object, Comment):
            #     serializer = CommentSerializer(item.item_object)
            # elif isinstance(item.item_object, Like):
            #     serializer = LikeSerializer(item.item_object)
            # elif isinstance(item.item_object, Friendship):
            #     serializer = FriendShipSerializer(item.item_object)
                items.append(serializer.data)
        response = {
            'type': 'inbox',
            'author': author.url,
            'items':items       
        }
        return Response(response, status=status.HTTP_200_OK)
    
    def post(self,request,author_id):
        author = get_object_or_404(Author,uid=author_id)
        if request.data.get('type').lower() == 'follow':
            serializer = FriendShipSerializer(data=request.data, context={'request': request})
            model = Friendship
            if serializer.is_valid():
            
                instance = serializer.save()
                
                inbox_item = Inbox_Item.objects.create(author=author,content_type=ContentType.objects.get_for_model(model),object_id=instance.uid)
                inbox_serializer = InboxSerializer(inbox_item, context={'request': request})
                return Response(inbox_serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        elif request.data.get('type').lower() == 'post':
            model = Post
            post_exist = Post.objects.get(uid=request.data.get('id').split('/')[-1])
            if post_exist:
                serializer = PostSerializer(post_exist, context={'request': request})
                inbox_item = Inbox_Item.objects.create(author=author,content_type=ContentType.objects.get_for_model(model),object_id=post_exist.uid)
                inbox_serializer = InboxSerializer(inbox_item, context={'request': request})
                return Response(inbox_serializer.data["contentObject"], status=status.HTTP_201_CREATED)
            else:
                serializer = PostSerializer(data=request.data, context={'request': request})
                if serializer.is_valid():
            
                    instance = serializer.save()
                    
                    inbox_item = Inbox_Item.objects.create(author=author,content_type=ContentType.objects.get_for_model(model),object_id=instance.uid)
                    inbox_serializer = InboxSerializer(inbox_item, context={'request': request})
                    return Response(inbox_serializer.data["contentObject"], status=status.HTTP_201_CREATED)

                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        elif request.data.get('type').lower() == 'comment':
            post = Post.objects.get(uid=request.data['id'].split("/")[6])
            author = Author.objects.get(uid=request.data['author']['id'].split('/')[-1])
            comment = Comment.objects.get(uid=request.data['id'].split('/')[-1])
            serializer = CommentSerializer(comment, context={'request': request})
            model = Comment
            
            inbox_item = Inbox_Item.objects.create(author=author,content_type=ContentType.objects.get_for_model(model),object_id=request.data['id'].split('/')[-1])
            inbox_serializer = InboxSerializer(inbox_item, context={'request': request})
            return Response(inbox_serializer.data, status=status.HTTP_201_CREATED)
        elif request.data.get('type').lower() == 'like':
            liker = request.user

            serializer = LikeSerializer(data=request.data, context={'author': liker, 'request': request})
            model = Like
            if serializer.is_valid():
                instance = serializer.save()
                inbox_item = Inbox_Item.objects.create(author=author,content_type=ContentType.objects.get_for_model(model),object_id=instance.uid)
                inbox_serializer = InboxSerializer(inbox_item, context={'request': request})
                return Response(inbox_serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': 'Invalid type'}, status=status.HTTP_400_BAD_REQUEST)
        

    def delete(self, request, author_id):
        author = get_object_or_404(Author, uid=author_id)
        inbox = Inbox_Item.objects.filter(author=author)
        inbox.delete()
        return Response({'message': 'Delete Success'}, status=status.HTTP_204_NO_CONTENT)
        
    
class AllPostView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    serializer_class = PostSerializer

    def get(self,request,author_id):
        author = get_object_or_404(Author,uid=author_id)
        posts = Post.objects.filter(author=author)
        serializer = PostSerializer(posts, many=True, context={'request': request})
        response = {
            "type": "posts",
            "items": serializer.data
        }
        return Response(response, status=status.HTTP_200_OK)
    def post(self,request,author_id):
        author = get_object_or_404(Author,uid=author_id)
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class CommentView(generics.CreateAPIView):
    pagination_class = PageNumberPagination
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CommentSerializer

    def get(self, request, author_id, post_id):
        author = get_object_or_404(Author,uid=author_id)
        post = get_object_or_404(Post, uid=post_id)
        page_number = request.query_params.get('page',1)
        page_size = request.query_params.get('page_size', self.pagination_class.page_size)
        try:
            page_number = int(page_number)
            page_size = int(page_size)
        except ValueError:
            return Response({'error': 'Invalid page or page_size parameter'}, status=400)
        
        queryset = Comment.objects.filter(post=post).order_by('published')
        paginator = PageNumberPagination()
        paginator.page_size = page_size
        page = paginator.paginate_queryset(queryset,request)
        comment = CommentSerializer(page, many=True, context={'post': post, 'author': author, 'request': request})
        response = {
            "type": "comments",
            "comments": comment.data,
            "post": post.id,
            'id': f'{post.id}/comments',
            'pagination': {
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link(),
                'page_number': page_number,
                'page_size': page_size,
            },
        }
        return Response(response, status=status.HTTP_200_OK)
    
    def post(self, request, author_id, post_id):
        post = get_object_or_404(Post, uid=post_id)
        author = get_object_or_404(Author, uid=request.data['author']['id'].split('/')[-1])
        serializer = CommentSerializer(data=request.data, context={'post': post, 'author': author, 'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PostImageView(generics.CreateAPIView):
    serializer_class = PostImageSerializer
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, author_id, post_id):
        author = get_object_or_404(Author,uid=author_id)
        post = get_object_or_404(Post,uid=post_id)
        postimage = PostImage.objects.filter(post=post).first()
        if postimage == None or '':
            return Response({'error': 'no image'}, status=404)
        serializer = PostImageSerializer(postimage,context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
        
    def post(self, request, author_id, post_id):
        author = get_object_or_404(Author,uid=author_id)
        post = get_object_or_404(Post,uid=post_id)
        postimage = PostImage.objects.filter(post=post).first()
        if postimage == None or '':
            serializer = PostImageSerializer(data=request.data, context={'post': post, 'author': author, 'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response("Added an image to post", status=status.HTTP_201_CREATED)
        else:
            serializer = PostImageSerializer(instance=postimage, data=request.data, context={'post': post, 'author': author, 'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response("Updated Image Successfully", status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, author_id, post_id):
        author = get_object_or_404(Author,uid=author_id)
        post = get_object_or_404(Post,uid=post_id)
        postimage = PostImage.objects.filter(post=post).first()
        if postimage == None or '':
            return Response({'error': 'no image'}, status=404)
        postimage.delete()
        return Response({'message': 'Delete Success'}, status=status.HTTP_204_NO_CONTENT)
    
class LikePostView(generics.CreateAPIView):
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LikeSerializer

    def get(self, request, author_id, post_id):
        author = get_object_or_404(Author, uid=author_id)
        post = get_object_or_404(Post, uid=post_id)
        likes = Like.objects.filter(object_id=post.uid)
        serializer = LikeSerializer(likes, many=True, context={'author': author, 'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class LikeCommentView(generics.CreateAPIView):
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LikeSerializer

    def get(self, request, author_id, post_id, comment_id):
        author = get_object_or_404(Author, uid=author_id)
        comment = get_object_or_404(Comment, uid=comment_id)
        likes = Like.objects.filter(object_id=comment.uid)
        serializer = LikeSerializer(likes, many=True, context={'author': author, 'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class LikedView(generics.CreateAPIView):
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LikeSerializer

    def get(self, request, author_id):
        author = get_object_or_404(Author, uid=author_id)
        likes = Like.objects.filter(author=author)
        serializer = LikeSerializer(likes, many=True, context={'request': request})
        response = {
            'type': 'liked',
            'items': serializer.data
        }
        return Response(response, status=status.HTTP_200_OK)
    
class FollowRequestView(generics.CreateAPIView):
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, author_id):
        author = get_object_or_404(Author, uid=author_id)
        requests = Friendship.objects.filter(object=author, status=1)
        serializer = FriendShipSerializer(requests, many=True, context={'request':request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
class FriendsView(generics.CreateAPIView):
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, author_id):
        author = get_object_or_404(Author, uid=author_id)
        requests = Friendship.objects.filter(object=author, status=3) | Friendship.objects.filter(actor=author, status=3)
        serializer = FriendShipSerializer(requests, many=True, context={'request':request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class GetNodesView(generics.CreateAPIView):
    def get(self, request):
        nodes = Author.objects.filter(is_a_node=True)
        serializer = AuthorSerializer(nodes, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
class SetupNode(generics.CreateAPIView):
    
    
    def get(self, request):
        name = 'node-hello-world'
        password = 'socialpassword'
        request = requests.get('https://webwizards-backend-952a98ea6ec2.herokuapp.com/service/authors/', auth=HTTPBasicAuth(name, password))
        authors = request.json()['items']
        for author in authors:
            try:
                curr_author = Author.objects.get(uid=author['id'].split('/')[-1])
            except:            
                curr_author = Author.objects.create(
                    uid = author['id'].split('/')[-1],
                    username = author['displayName'] + str(random.randint(0, 1000)),
                    password = author['displayName'],
                    displayName = author['displayName'],
                    github = author['github'],
                    host = author['host'],
                    id = author['id'],
                    url = author['url'],
                    profilePicture = author['profileImage'],
                    is_approved = author['registered']        
                )
            finally:
                post_request = requests.get(f'https://webwizards-backend-952a98ea6ec2.herokuapp.com/service/authors/{curr_author.uid}/posts/', auth=HTTPBasicAuth(name, password))
                if 'items' in post_request.json():
                    posts = post_request.json()['items']
                    for post in posts:
                        try:
                            curr_post = Post.objects.get(uid=post['id'].split('/')[-1])
                        except:            
                            curr_post = Post.objects.create(
                                uid = post['id'].split('/')[-1],
                                title = post['title'],
                                id = post['id'],
                                origin = post['origin'],
                                source = post['source'],
                                contentType = post['contentType'],
                                content = post['content'],
                                author = curr_author, 
                                categories = str(post['categories']),
                                published = post['published'],
                                comments = post['comments'],
                                count = post['count'],
                                visibility = post['visibility'],
                                unlisted = post['unlisted']
                            )
                            if post['has_image'] == True:
                                image_request = requests.get(f'https://webwizards-backend-952a98ea6ec2.herokuapp.com/service/authors/{curr_author.uid}/posts/{curr_post.uid}/image', auth=HTTPBasicAuth(name, password))
                                if image_request.json()['image_type'] == 'url':
                                    PostImage.objects.create(
                                    post = curr_post,
                                    image_url = image_request.json()['image']
                                )
                                else:
                                    image = image_request.json()['image']
                                    before = len(image)
                                    cleaned = re.sub(r'[^a-zA-Z0-9/+]','',image)
                                    after = len(cleaned)
                                    padding_length = max(0, before - after)
                                    padded_string = cleaned.ljust(after+padding_length, '=')
                                    image_type = image_request.json()['image_type'].split(';')[0].split('/')[-1]
                                    data = ContentFile(base64.b64decode(padded_string), name=str(random.randint(0,1000)) + str(random.randint(0,1000)) + '.' + image_type)
                                    PostImage.objects.create(
                                        post = curr_post,
                                        image = data
                                    )
                        finally:
                            comment_request = requests.get(f'https://webwizards-backend-952a98ea6ec2.herokuapp.com/service/authors/{curr_author.uid}/posts/{curr_post.uid}/comments/', auth=HTTPBasicAuth(name, password))
                            
                            if 'comments' in comment_request.json():
                                comments = comment_request.json()['comments']
                                for comment in comments:
                                    try:
                                        curr_comment = Comment.objects.get(uid=comment['id'].split('/')[-1])
                                    except:
                                        curr_comment = Comment.objects.create(
                                            uid = comment['id'].split('/')[-1],
                                            author = curr_author,
                                            post = curr_post,
                                            comment = comment['comment'],
                                            contentType = comment['contentType'],
                                            published = comment['published']
                                        )


        name2 = 'node-hello-world'
        password2 = 'chimpchatapi'
        request2 = requests.get('https://chimp-chat-1e0cca1cc8ce.herokuapp.com/authors/', auth=HTTPBasicAuth(name2, password2))
        authors2 = request2.json()['items']
        for author in authors2:
            try:
                curr_author = Author.objects.get(uid=author['id'].split('/')[-1])
            except:            
                curr_author = Author.objects.create(
                    uid = author['id'].split('/')[-1],
                    username = author['displayName'] + str(random.randint(0, 1000)),
                    password = author['displayName'],
                    displayName = author['displayName'],
                    github = author['github'],
                    host = author['host'],
                    id = author['id'],
                    url = author['url'],
                    profilePicture = author['profileImage'],
                    is_approved = True        
                )
            finally:
                post_request2 = requests.get(f'https://chimp-chat-1e0cca1cc8ce.herokuapp.com/authors/{curr_author.uid}/posts/', auth=HTTPBasicAuth(name2, password2))
                if 'items' in post_request2.json():
                    posts = post_request2.json()['items']
                    for post in posts:
                        try:
                            curr_post = Post.objects.get(uid=post['id'].split('/')[-1])
                        except:
                            curr_content = post['content']
                            if post['contentType'] == 'image/jpeg;base64' or post['contentType'] == 'image/png;base64':
                                image = post['content']
                                before = len(image)
                                cleaned = re.sub(r'[^a-zA-Z0-9/+]','',image)
                                after = len(cleaned)
                                padding_length = max(0, before - after)
                                padded_string = cleaned.ljust(after+padding_length, '=')
                                image_type = post['contentType'].split(';')[0].split('/')[-1]
                                data = ContentFile(base64.b64decode(padded_string), name=str(random.randint(0,1000)) + str(random.randint(0,1000)) + '.' + image_type)
                                PostImage.objects.create(
                                    post = curr_post,
                                    image = data
                                )
                                curr_content = ''               
                            curr_post = Post.objects.create(
                                uid = post['id'].split('/')[-1],
                                title = post['title'],
                                id = post['id'],
                                origin = post['origin'],
                                source = post['source'],
                                description = post['description'],
                                contentType = post['contentType'],
                                content = curr_content,
                                author = curr_author, 
                                categories = str(post['categories']),
                                published = post['published'],
                                comments = post['comments'],
                                count = post['count'],
                                visibility = post['visibility'],
                                unlisted = post['unlisted']
                            )
                        finally:
                            comment_request2 = requests.get(f'https://chimp-chat-1e0cca1cc8ce.herokuapp.com/authors/{curr_author.uid}/posts/{curr_post.uid}/comments/?page=1&size=1000', auth=HTTPBasicAuth(name2, password2))
                            if 'comments' in comment_request2.json():
                                comments = comment_request2.json()['comments']
                                for comment in comments:
                                    try:
                                        curr_comment = Comment.objects.get(uid=comment['id'].split('/')[-1])
                                    except:
                                        curr_comment = Comment.objects.create(
                                            uid = comment['id'].split('/')[-1],
                                            author = curr_author,
                                            post = curr_post,
                                            comment = comment['comment'],
                                            contentType = comment['contentType'],
                                            published = comment['published']
                                        )
                        
        name3 = 'node-hello-world'
        password3 = 'node-hello-world'
        request3 = requests.get('https://distributed-network-37d054f03cf4.herokuapp.com/api/authors/', auth=HTTPBasicAuth(name3, password3), headers={'Referer':'https://cmput404-project-backend-a299a47993fd.herokuapp.com/'})
        authors3 = request3.json()['items']
        for author in authors3:
            try:
                curr_author =Author.objects.get(uid=author['id'].split('/')[-1])
            except:            
                curr_author = Author.objects.create(
                    uid = author['id'].split('/')[-1],
                    username = author['displayName'] + str(random.randint(0, 1000)),
                    password = author['displayName'],
                    displayName = author['displayName'],
                    github = author['github'],
                    host = author['host'],
                    id = author['id'],
                    url = author['url'],
                    profilePicture = author['profileImage'],
                    is_approved = True        
                )
            finally:
                post_request3 = requests.get(f'https://distributed-network-37d054f03cf4.herokuapp.com/api/authors/{curr_author.uid}/posts/', auth=HTTPBasicAuth(name3, password3), headers={'Referer':'https://cmput404-project-backend-a299a47993fd.herokuapp.com/'})
                posts = post_request3.json()
                for post in posts:
                    try:
                        curr_post = Post.objects.get(uid=post['id'].split('/')[-1])
                    except: 
                        curr_content = post['content']
                        if post['contentType'] == 'image/jpeg;base64' or post['contentType'] == 'image/png;base64':
                            image = post['content'].split(',')[-1]
                            before = len(image)
                            cleaned = re.sub(r'[^a-zA-Z0-9/+]','',image)
                            after = len(cleaned)
                            padding_length = max(0, before - after)
                            padded_string = cleaned.ljust(after+padding_length, '=')
                            image_type = post['contentType'].split(';')[0].split('/')[-1]
                            data = ContentFile(base64.b64decode(padded_string), name=str(random.randint(0,1000)) + str(random.randint(0,1000)) + '.' + image_type)
                            PostImage.objects.create(
                                post = curr_post,
                                image = data
                            )
                            curr_content = ''               
                        curr_post = Post.objects.create(
                            uid = post['id'].split('/')[-1],
                            title = post['title'],
                            id = post['id'],
                            origin = post['origin'],
                            source = post['source'],
                            description = post['description'],
                            contentType = post['contentType'],
                            content = curr_content,
                            author = curr_author, 
                            categories = str(post['categories']),
                            published = post['published'],
                            comments = post['comments'],
                            count = post['count'],
                            visibility = post['visibility'],
                            unlisted = post['unlisted']
                        )
                    finally:
                        comment_request3 = requests.get(f'https://distributed-network-37d054f03cf4.herokuapp.com/api/authors/{curr_author.uid}/posts/{curr_post.uid}/comments/', auth=HTTPBasicAuth(name3, password3), headers={'Referer':'https://cmput404-project-backend-a299a47993fd.herokuapp.com/'})
                        if 'comments' in comment_request3.json():
                            comments = comment_request3.json()['comments']
                            for comment in comments:
                                try:
                                    curr_comment = Comment.objects.get(uid=comment['id'].split('/')[-1])
                                except:
                                    curr_comment = Comment.objects.create(
                                        uid = comment['id'].split('/')[-1],
                                        author = curr_author,
                                        post = curr_post,
                                        comment = comment['comment'],
                                        contentType = comment['contentType'],
                                        published = comment['published']
                                    )
        return Response('Set up complete', status=status.HTTP_200_OK)

class GetPublicPost(generics.CreateAPIView):
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PostSerializer
    def get(self, request):
        posts = Post.objects.filter(visibility='PUBLIC', unlisted=False)
        serializer = PostSerializer(posts, many=True, context={'request': request})
        response = {
            "type": "posts",
            "items": serializer.data
        }
        return Response(response, status=status.HTTP_200_OK)