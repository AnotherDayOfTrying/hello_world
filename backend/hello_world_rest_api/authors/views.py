from django.shortcuts import get_object_or_404
from .serializers import *
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from .models import *
from rest_framework.decorators import api_view

# Create your views here.
class Signup(generics.CreateAPIView):
    
    serializer_class = SignUpSerializer

    def post(self,request):
        serializer = self.serializer_class(data = request.data)
        if serializer.is_valid():
            serializer.save()
            response = {
                'message': 'User created successfully',
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
            login(request, author)
            response = {
                'message': 'User logged in successfully',
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class Signout(generics.CreateAPIView):
    
    def post(self, request):
        logout(request)
        return Response(None, status=status.HTTP_200_OK)
        

class SendFriendRequest(generics.CreateAPIView):
    
    serializer_class = SendFriendRequestSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            response = serializer.save()
            return Response({'message': 'Request sent', 'friendship_id': response.id}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FriendRequestResponse(generics.CreateAPIView):

    serializer_class = RespondFriendRequestSerializer
    
    def post(self, request, friendship_id):
        friendship = get_object_or_404(Friendship, id=friendship_id)
        serializer = self.serializer_class(friendship, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Success'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DeleteFriend(generics.CreateAPIView):
    
    #serializer_class = DeleteFriendSerializer
    
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
    
    serializer_class = PostCommentSerializer
    
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
    
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        author = request.user
        serializer = self.serializer_class(data=request.data, context={'post': post, 'author': author})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Success'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def getAllAuthors(request):
    authors  = Author.objects.filter(is_approved=True,displayName__isnull=False)
    serializer = AuthorSerializer(authors, many=True)
    response = {
        "type": "authors",
        "items": serializer.data
    }
    return Response(response, status=status.HTTP_200_OK)

@api_view(['GET','POST'])
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
def getFriendRequests(request):
    author = request.user
    friends = Friendship.objects.filter(reciever=author,status=1)
    serializer = FriendShipSerializer(friends, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def getFriends(request):
    author = request.user
    friends = Friendship.objects.filter(reciever=author,status__in=[2,3])
    serializer = FriendShipSerializer(friends, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


class Liking(generics.CreateAPIView):
    
    serializer_class = LikeingSerializer
    
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
    
    serializer_class = UnlikingSerializer
    
    def post(self, request, like_id):
        like = get_object_or_404(Like, id=like_id)
        serializer = self.serializer_class(like, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Success'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class UploadPost(generics.CreateAPIView):

    serializer_class = UploadPostSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'author': request.user})
        if serializer.is_valid():
            serializer.save()
            response = {
                'message': 'Post created successfully',
                'id': serializer.data['id'],
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class EditPost(generics.CreateAPIView):

    serializer_class = EditPostSerializer
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

    def delete(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        post.delete()
        return Response({'message': 'Delete Success'}, status=status.HTTP_204_NO_CONTENT)
    

class GetPublicPost(generics.CreateAPIView):

    serializer_class = UploadPostSerializer

    def get(self, request):
        public_posts = Post.objects.filter(privacy='PUBLIC')
        serializer = self.serializer_class(public_posts, many=True)
        response = {
            "type": "posts",
            "items": serializer.data
        }
        return Response(response, status=status.HTTP_200_OK)
    
@api_view(['GET'])
def getlikesonpost(request, author_id, post_id):
    post_likes = Like.objects.filter(content_type=ContentType.objects.get_for_model(Post), object_id=post_id)
    serializer = LikeSerializer(post_likes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
    
@api_view(['GET'])
def getlikesoncomment(request, author_id, post_id, comment_id):
    comment_likes = Like.objects.filter(content_type=ContentType.objects.get_for_model(Comment), object_id=comment_id)
    serializer = LikeSerializer(comment_likes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def getlikesfromauthor(request, author_id):
    author = Author.objects.get(id=author_id)
    likes = Like.objects.filter(liker=author)
    serializer = LikeSerializer(likes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)