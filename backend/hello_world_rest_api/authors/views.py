from django.shortcuts import render
from .serializers import SignupSerializer
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, authenticate
# Create your views here.
class Signup(generics.CreateAPIView):
    
    serializer_class = SignupSerializer
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


