from django.shortcuts import render
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.decorators import action

# Create your views here.

class PingView(ViewSet):
    @action(methods=['get'], detail=False, url_path="")
    def ping(self, request):
        return Response({'pong'})