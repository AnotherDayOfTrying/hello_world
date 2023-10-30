from . import views
from django.urls import path

app_name = 'authors'
urlpatterns = [
    path('signup/', views.Signup.as_view(), name = 'signup'),
    path('signin/', views.Signin.as_view(), name = 'signin'),
    path('signout/', views.Signout.as_view(), name = 'signout'),
    path('frequests/send/', views.SendFriendRequest.as_view(), name = 'send-friend-request'),
    path('frequests/respond/<int:friendship_id>/', views.FriendRequestResponse.as_view(), name = 'respond-friend-request'),
    path('comments/<int:post_id>/', views.PostComment.as_view(), name = 'post-comment'),
    path('likes/', views.Liking.as_view(), name = 'liking'),
    path('unlike/<int:like_id>/', views.Unliking.as_view(), name = 'unliking'),
    path('authors/', views.getAllAuthors, name = 'get-all-authors'),
    path('authors/<uuid:author_id>',views.getOneAuthor, name = 'getoneauthor'),
    path('authors/requests/', views.getFriendRequests, name = 'getfriendrequests'),
    path('post/upload/', views.UploadPost.as_view(), name = 'upload-post'),
    path('post/edit/', views.EditPost.as_view(), name = 'edit-post'),
    path('post/delete/<int:post_id>/', views.DeletePost.as_view(), name = 'delete-post')
]