from . import views
from django.urls import path

app_name = 'authors'
urlpatterns = [
    path('signup/', views.Signup.as_view(), name = 'signup'),
    path('signin/', views.Signin.as_view(), name = 'signin'),
    path('frequests/send/', views.SendFriendRequest.as_view(), name = 'send-friend-request'),
    path('frequests/respond/<int:friendship_id>/', views.FriendRequestResponse.as_view(), name = 'respond-friend-request'),
    path('comments/<int:post_id>/', views.PostComment.as_view(), name = 'post-comment'),
    path('likes/', views.Liking.as_view(), name = 'liking'),
    path('unlike/<int:like_id>/', views.Unliking.as_view(), name = 'unliking'),
]