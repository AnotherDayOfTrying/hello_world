from django.shortcuts import render
from .serializers import SignUpSerializer, SignInSerializer
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, authenticate
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
