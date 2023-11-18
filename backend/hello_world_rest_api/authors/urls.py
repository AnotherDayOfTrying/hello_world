from . import views
from django.urls import path

app_name = 'authors'
urlpatterns = [
    path('signup/', views.Signup.as_view(), name = 'signup'),
    path('signin/', views.Signin.as_view(), name = 'signin'),
    path('frequests/send/', views.SendFriendRequest.as_view(), name = 'send-friend-request'),
    path('frequests/respond/<int:friendship_id>/', views.FriendRequestResponse.as_view(), name = 'respond-friend-request'),
    path('frequests/delete/<int:friendship_id>/', views.DeleteFriend.as_view(), name = 'delete-friend'),
    path('comments/get/<int:post_id>', views.GetComment.as_view(), name = 'get-comment'),
    path('comments/<int:post_id>/', views.PostComment.as_view(), name = 'post-comment'),
    path('likes/', views.Liking.as_view(), name = 'liking'),
    path('unlike/<int:like_id>/', views.Unliking.as_view(), name = 'unliking'),
    path('authors/', views.AllAuthorsView.as_view(), name = 'get-all-authors'),
    path('authors/<uuid:author_id>',views.getOneAuthor, name = 'getoneauthor'),
    path('authors/requests/', views.getFriendRequests, name = 'getfriendrequests'),
    path('authors/friends/', views.getFriends, name = 'getfriends'),
    path('post/upload/', views.UploadPost.as_view(), name = 'upload-post'),
    path('post/edit/<int:post_id>/', views.EditPost.as_view(), name='edit-post'),
    path('post/delete/<int:post_id>/', views.DeletePost.as_view(), name = 'delete-post'),
    path('post/getpublic/', views.GetPublicPost.as_view(), name = 'get-public-post'),
    path('post/getprivate/', views.getPrivatePost, name = 'get-private-post'),
    path('post/getunlisted/', views.getUnlistedPost, name = 'get-unlisted-post'),
    path('post/getowned/', views.getOwnPost, name = 'get-own-post'),
    path('authors/<uuid:author_id>/posts/<int:post_id>/likes/', views.getlikesonpost, name = 'getlikesonpost'),
    path('authors/<uuid:author_id>/posts/<int:post_id>/comments/<int:comment_id>/likes/', views.getlikesoncomment, name = 'getlikesoncomment'),
    path('authors/likes/', views.getlikesfromauthor, name = 'getlikesfromauthor'),

]