from django.shortcuts import render
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import JsonResponse
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated

# Create your views here.

class PingView(ViewSet):
    @action(methods=['get'], detail=False, url_path="")
    def ping(self, request):
        return Response({'pong'})
    
class SessionView(ViewSet):
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]

    @action(methods=['get'], detail=False, url_path="")
    def session(self, request):
        print(request)
        return JsonResponse({'isAuthenticated': True})