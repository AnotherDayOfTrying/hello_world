from django.shortcuts import render, get_object_or_404
from .serializers import *
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, authenticate
from .models import *
from rest_framework.decorators import api_view

# Create your views here.
class Signup(generics.CreateAPIView):
    
    serializer_class = SignUpSerializer
    #permission_classes = (AllowAny,)

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

class SendFriendRequest(generics.CreateAPIView):
    
    serializer_class = SendFriendRequestSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Request sent'}, status=status.HTTP_200_OK)
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
    authors = Author.objects.all()
    serializer = AuthorSerializer(authors, many=True)
    response = {
        "type": "authors",
        "items": serializer.data
    }
    return Response(response, status=status.HTTP_200_OK)