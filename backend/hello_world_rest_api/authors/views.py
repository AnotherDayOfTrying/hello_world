from django.shortcuts import get_object_or_404
from .serializers import *
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from .models import *
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token


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
                'data': serializer.data
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
            return Response({'message': 'Request sent', 'friendship_id': response.id}, status=status.HTTP_200_OK)
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

@api_view(['GET'])
# @permission_classes([permissions.IsAuthenticated])
def getAllAuthors(request):
    authors  = Author.objects.filter(is_approved=True,displayName__isnull=False)
    serializer = AuthorSerializer(authors, many=True)
    response = {
        "type": "authors",
        "items": serializer.data
    }
    return Response(response, status=status.HTTP_200_OK)

@api_view(['GET','POST'])
# @permission_classes([permissions.IsAuthenticated])
def getOneAuthor(request, author_id):
    author = get_object_or_404(Author,id=author_id)
    if request.method == 'GET':
        serializer = AuthorSerializer(author)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = AuthorSerializer(instance=author, data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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
            response = {
                'message': 'success',
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

    serializer_class = UploadPostSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        title = request.data.get('title')
        content_type = request.data.get('content_type')
        privacy = request.data.get('privacy')
        text = request.data.get('text')
        image_files = request.FILES.getlist('images')
        post = Post.objects.create(
            author=request.user,
            title=title,
            content_type=content_type,
            privacy=privacy,
            text=text,
            
        )
        image_files = request.FILES.getlist('images')
        for image_file in image_files:
            post_image = PostImage.objects.create(post=post, image=image_file)
            post.images.add(post_image)
        serializer = self.serializer_class(post)
        response_data = {
            'message': 'Post created successfully',
            'data': serializer.data
        }
        return Response(response_data, status=status.HTTP_201_CREATED)
    

class EditPost(generics.CreateAPIView):

    serializer_class = EditPostSerializer
    # permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'author': request.user})
        if serializer.is_valid():
            #serializer.save()
            response = {
                'message': 'Post updated successfully',
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    
class DeletePost(generics.CreateAPIView):

    serializer_class = EditPostSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        post.delete()
        return Response({'message': 'Delete Success'}, status=status.HTTP_204_NO_CONTENT)
    

class GetPublicPost(generics.CreateAPIView):

    serializer_class = GetPostSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        public_posts = Post.objects.filter(privacy='PUBLIC')
        serializer = self.serializer_class(public_posts, many=True)
        response = {
            "type": "posts",
            "items": serializer.data
        }
        return Response(response, status=status.HTTP_200_OK)
    
@api_view(['GET'])
def getPrivatePost(request):
    author = request.user
    friends = Friendship.objects.filter(reciever=author,status__in=[2,3])
    serializer = FriendShipSerializer(friends, many=True)
    friends = []
    for friendship in serializer.data:
        friends.append(friendship['sender'])
        friends.append(friendship['reciever'])
    friends = set(friends)
    response = {"type": "posts",}
    num = 1
    for friend in friends:
        author = Author.objects.filter(id=friend)
        posts = Post.objects.filter(author__in = author, privacy='PRIVATE')
        serializer = GetPostSerializer(posts, many = True)
        if serializer.data:
            response[f"friend{num}"] = serializer.data
            num += 1
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
def getlikesfromauthor(request, author_id):
    author = Author.objects.get(id=author_id)
    likes = Like.objects.filter(liker=author)
    serializer = LikeSerializer(likes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)