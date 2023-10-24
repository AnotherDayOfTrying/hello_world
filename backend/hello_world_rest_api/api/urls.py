from django.urls import path, include
from . import views
from rest_framework import routers


router = routers.SimpleRouter()
router.register('', views.PingView, basename='ping')

app_name = 'api'
urlpatterns = [
    path('', include(router.urls))
]