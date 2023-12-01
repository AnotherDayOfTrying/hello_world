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
from PIL import Image
from io import BytesIO
import base64


# Create your views here.
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
        

class SendFriendRequest(generics.CreateAPIView):
    
    serializer_class = SendFriendRequestSerializer
    # permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            response = serializer.save()
            sender = request.user
            reciever_id = serializer.validated_data['receiver_id']
            reciver = get_object_or_404(Author, id=reciever_id)
            sender_serializer = AuthorSerializer(sender)
            reciever_serializer = AuthorSerializer(reciver)
            return Response({'type':'Follow' ,'summary': f'{sender.displayName} wants to follow {reciver.displayName}', 'actor': sender_serializer.data, 'object': reciever_serializer.data, 'friendship_id': response.id}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FriendRequestResponse(generics.CreateAPIView):

    serializer_class = RespondFriendRequestSerializer
    # permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, friendship_id):
        friendship = get_object_or_404(Friendship, id=friendship_id)
        serializer = self.serializer_class(friendship, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Success'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DeleteFriend(generics.CreateAPIView):
    
    #serializer_class = DeleteFriendSerializer
    # permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, friendship_id):
        friendship = get_object_or_404(Friendship, id=friendship_id)
        """serializer = self.serializer_class(friendship, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Success'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) """
        reverse = Friendship.objects.filter(sender=friendship.reciever, reciever=friendship.sender).first()
        if reverse and reverse.status == 3:
            reverse.status = 2
            reverse.save()
        friendship.delete()
        return Response({'message': 'Delete Success'}, status=status.HTTP_204_NO_CONTENT)

class GetComment(generics.ListAPIView):
    
    serializer_class = GetCommentSerializer
    # permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, post_id):
        authors = Comment.objects.filter(post=post_id)
        serializer = self.get_serializer(authors, many=True)
        response = {
            "type": "comments",
            "items": serializer.data
        }
        return Response(response, status=status.HTTP_200_OK)

class PostComment(generics.CreateAPIView):
    
    serializer_class = PostCommentSerializer
    # permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        author = request.user
        serializer = self.serializer_class(data=request.data, context={'post': post, 'author': author})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Success'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        
        queryset = Author.objects.filter(is_approved=True, displayName__isnull=False).order_by('uid')
        paginator = PageNumberPagination()
        paginator.page_size = page_size
        page = paginator.paginate_queryset(queryset,request)
        serializer = AuthorSerializer(page, many=True)
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

class CallingAuthorView(generics.RetrieveAPIView):
    serializer_class = AuthorSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        author = get_object_or_404(Author,uid=request.user.uid)
        serializer = AuthorSerializer(author)
        response = {
            "type": "author",
            "item": serializer.data,
        }
        return Response(response, status=status.HTTP_200_OK)

@api_view(['GET','POST'])
@authentication_classes([TokenAuthentication, NodesAuthentication])
@permission_classes([permissions.IsAuthenticated])
def getOneAuthor(request, author_id):
    author = get_object_or_404(Author,pk=request.user.uid)
    if request.method == 'GET':
        serializer = AuthorSerializer(author)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = AuthorSerializer(instance=author, data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FriendshipView(generics.CreateAPIView):
    serializer_class = FriendShipSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request,author_id,foreign_author_id):
        author = get_object_or_404(Author,uid=author_id)
        foreign_author = get_object_or_404(Author,uid=foreign_author_id)
        friendship = Friendship.objects.filter(sender=foreign_author,reciever=author,status__in = [2,3])
        if friendship:
            return Response({'is_follower': True}, status=status.HTTP_200_OK)
        else:
            return Response({'is_follower': False}, status=status.HTTP_200_OK)
    def delete(self, request,author_id,foreign_author_id):
        author = get_object_or_404(Author,uid=author_id)
        foreign_author = get_object_or_404(Author,uid=foreign_author_id)
        friendship = Friendship.objects.filter(actor=foreign_author,object=author,status__in = [2,3])
        reverse = Friendship.objects.filter(actor=author,object=foreign_author,status__in = [2,3])
        if reverse and reverse.status == 3:
            reverse.status = 2
            reverse.save()
        friendship.delete()
        return Response({'message': 'Delete Success'}, status=status.HTTP_204_NO_CONTENT)
        
'''
@api_view(['GET'])
@authentication_classes([TokenAuthentication, NodesAuthentication])
@permission_classes([permissions.IsAuthenticated])
def getFollowers(request, author_id):
    author = get_object_or_404(Author,uid=author_id)
    followers = Friendship.objects.filter(reciever=author,status__in = [2,3])
    followers = followers.values_list('sender', flat=True)
    followers = Author.objects.filter(uid__in=followers)
    serializer = AuthorSerializer(followers, many=True)
    response = {
        "type": "followers",
        "items": serializer.data,
    }
    return Response(response, status=status.HTTP_200_OK)
'''
@api_view(['GET'])
@authentication_classes([TokenAuthentication, NodesAuthentication])
@permission_classes([permissions.IsAuthenticated])
def checkFollowing(request,author_id,foreign_author_id):
    author = get_object_or_404(Author,uid=author_id)
    foreign_author = get_object_or_404(Author,uid=foreign_author_id)
    friendship = Friendship.objects.filter(sender=foreign_author,reciever=author,status__in = [2,3])
    if friendship:
        return Response({'is_follower': 1}, status=status.HTTP_200_OK)
    else:
        return Response({'is_follower': 0}, status=status.HTTP_200_OK)


@api_view(['GET'])
# @permission_classes([permissions.IsAuthenticated])
def getFriendRequests(request):
    author = request.user
    friends = Friendship.objects.filter(reciever=author,status=1)
    serializer = FriendShipSerializer(friends, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
# @permission_classes([permissions.IsAuthenticated])
def getFriends(request):
    author = request.user
    friends = Friendship.objects.filter(reciever=author,status__in=[2,3])
    serializer = FriendShipSerializer(friends, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


class Liking(generics.CreateAPIView):
    
    serializer_class = LikeingSerializer
    # permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        author = request.user
        serializer = self.serializer_class(data=request.data, context={'author': author})
        if serializer.is_valid():
            like_instance = serializer.save()
            author_serializer = AuthorSerializer(author)
            response = {
                'message': 'success',
                'summary': f'{author.displayName} Likes your post',
                'type': 'Like',
                'author': author_serializer.data,
                'like_id': like_instance.id,
            }
            return Response(response, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class Unliking(generics.CreateAPIView):
    
    # serializer_class = UnlikingSerializer
    # permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, like_id):
        like = get_object_or_404(Like, id=like_id)
        like.delete()
        return Response({'message': 'Delete Success'}, status=status.HTTP_204_NO_CONTENT)
        # serializer = self.serializer_class(like, data=request.data)
        # if serializer.is_valid():
        #     serializer.save()
        #     return Response({'message': 'Success'}, status=status.HTTP_200_OK)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class UploadPost(generics.CreateAPIView):
    # permission_classes = [permissions.IsAuthenticated]

    serializer_class = UploadPostSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'author': request.user})
        if serializer.is_valid():
            serializer.save()
            author_serializer = AuthorSerializer(request.user)
            comments = Comment.objects.filter(post = serializer.data['id'])
            if serializer.data['privacy'] == 'Unlisted':
                unlisted = True
            else:
                unlisted = False
            response = {
                'type': 'post',
                'title': serializer.data['title'], 
                'message': 'Post created successfully',
                'id': serializer.data['post_prime_key'],
                'origin': serializer.data['post_origin'],
                'source': serializer.data['post_source'],
                'description': "This post describes something",
                'contentType': serializer.data['content_type'],
                'content': 'Content displayed on post',
                'author': author_serializer.data,
                'count': len(comments),
                'comments': comments,
                'visibility': serializer.data['privacy'],
                'published': serializer.data['published'],
                'unlisted': unlisted,
                'data': serializer.data,
                'id2': serializer.data['id']
            }
            return Response(response, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class EditPost(generics.CreateAPIView):

    serializer_class = EditPostSerializer
    # permission_classes = [permissions.IsAuthenticated]
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        serializer = self.serializer_class(post, data=request.data, context={'author': request.user, 'request': request,})
        if serializer.is_valid():
            serializer.save()
            response = {
                'message': 'Post updated successfully',
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_200_OK)
    
    
    
class DeletePost(generics.CreateAPIView):

    serializer_class = EditPostSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        # remove the associated image from media/postimages folder if it exists
        if post.image:
            if os.path.exists(post.image.path):
                image = post.image.path
                os.remove(image)
        post.delete()
        return Response({'message': 'Delete Success'}, status=status.HTTP_204_NO_CONTENT)
    

class GetPublicPost(generics.CreateAPIView):

    serializer_class = GetPostSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        public_posts = Post.objects.filter(privacy='PUBLIC')
        serializer = self.serializer_class(public_posts, many=True)
        response = {
            "type": "post",
            "items": serializer.data
        }
        return Response(response, status=status.HTTP_200_OK)
    
@api_view(['GET'])
def getPrivatePost(request):
    author = request.user
    friends = Friendship.objects.filter(reciever=author,status__in=[2,3]) | Friendship.objects.filter(sender=author,status__in=[2,3])
    serializer = FriendShipSerializer(friends, many=True)
    friends = []
    for friendship in serializer.data:
        friends.append(friendship['sender'])
        friends.append(friendship['reciever'])
    friends = set(friends)
    response = {"type": "posts", "items": []}
    for friend in friends:
        author = Author.objects.filter(id=friend)
        posts = Post.objects.filter(author__in = author, privacy='PRIVATE')#.exclude(author=request.user)
        serializer = GetPostSerializer(posts, many = True)
        if serializer.data:
            response["items"].append(serializer.data)
    return Response(response, status=status.HTTP_200_OK)

@api_view(['GET'])
def getUnlistedPost(request):
    author = request.user
    unlisted_posts = Post.objects.filter(privacy='UNLISTED', author=author)
    serializer = GetPostSerializer(unlisted_posts, many=True)
    response = {
        "type": "posts",
        "items": serializer.data
    }
    return Response(response, status=status.HTTP_200_OK)

@api_view(['GET'])
def getOwnPost(request):
    author = request.user
    posts = Post.objects.filter(author=author)
    serializer = GetPostSerializer(posts, many=True)
    response = {
        "type": "posts",
        "items": serializer.data
    }
    return Response(response, status=status.HTTP_200_OK)
    
@api_view(['GET'])
# @permission_classes([permissions.IsAuthenticated])
def getlikesonpost(request, author_id, post_id):
    post_likes = Like.objects.filter(content_type=ContentType.objects.get_for_model(Post), object_id=post_id)
    serializer = LikeSerializer(post_likes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
    
@api_view(['GET'])
# @permission_classes([permissions.IsAuthenticated])
def getlikesoncomment(request, author_id, post_id, comment_id):
    comment_likes = Like.objects.filter(content_type=ContentType.objects.get_for_model(Comment), object_id=comment_id)
    serializer = LikeSerializer(comment_likes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
# @permission_classes([permissions.IsAuthenticated])
def getlikesfromauthor(request):
    author = request.user
    likes = Like.objects.filter(liker=author)
    serializer = LikeSerializer(likes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

class AllPostView(generics.CreateAPIView):
    pagination_class = PageNumberPagination
    serializer_class = RemotePostSerializer
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request,author_id):
        author = get_object_or_404(Author,uid=author_id)
        page_number = request.query_params.get('page',1)
        page_size = request.query_params.get('page_size', self.pagination_class.page_size)
        try:
            page_number = int(page_number)
            page_size = int(page_size)
        except ValueError:
            return Response({'error': 'Invalid page or page_size parameter'}, status=400)
        
        queryset = Post.objects.filter(author=author).order_by('-published')
        paginator = PageNumberPagination()
        paginator.page_size = page_size
        page = paginator.paginate_queryset(queryset,request)
        translated_post = []
        for i in page:
            if i.content_type == 'IMAGE':
                contentType = 'image/png'
            elif i.content_type == 'TEXT':
                contentType = 'text/plain'
            if i.privacy == 'PUBLIC':
                visibility = 'PUBLIC'
                unlisted = False
            elif i.privacy == 'PRIVATE':
                visibility = 'FRIENDS'
                unlisted = False
            elif i.privacy == 'UNLISTED':
                visibility = 'PUBLIC'
                unlisted = True
            translated = {
                'type': 'post',
                'title': i.title,
                'id': i.post_prime_key,
                'origin': i.post_origin,
                'source': i.post_source,
                'description': "This post describes something",
                'contentType': contentType,
                'content': i.text,
                'author': AuthorSerializer(i.author).data,
                'count': len(Comment.objects.filter(post=i.id)),
                'comments': i.post_prime_key + '/comments/',
                'visibility': visibility,
                'published': i.published,
                'unlisted': unlisted,
                'categories': [],
            }
            translated_post.append(translated)
        serializer = RemotePostSerializer(translated_post, many=True)
        response = {
            "type": "posts",
            "items": serializer.data,
            'pagination': {
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link(),
                'page_number': page_number,
                'page_size': page_size,
            },
        }
        return Response(response, status=status.HTTP_200_OK)

class PostImageView(generics.CreateAPIView):
    serializer_class = RemotePostImageSerializer
    authentication_classes = [TokenAuthentication, NodesAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, author_id, post_id):
        author = get_object_or_404(Author,uid=author_id)
        post = get_object_or_404(Post,uid=post_id)
        if post.image == None or '':
            return Response({'error': 'no image'}, status=404)
        image_path = post.image.path
        with open(image_path, "rb") as image_file:
            image_data = image_file.read()

            img_str = base64.b64encode(image_data)
            response_str = {'data':"image/jpeg;base64," + img_str.decode('utf-8')}
        serializer = RemotePostImageSerializer(response_str)
        
        return Response(serializer.data, status=status.HTTP_200_OK)