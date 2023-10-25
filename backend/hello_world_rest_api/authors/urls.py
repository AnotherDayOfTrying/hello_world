from . import views
from django.urls import path

app_name = 'authors'
urlpatterns = [
    path('signup/', views.Signup.as_view(), name = 'signup'),
    path('signin/', views.Signin.as_view(), name = 'signin')
]