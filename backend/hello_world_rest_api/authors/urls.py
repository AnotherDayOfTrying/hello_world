from . import views
from django.urls import path

app_name = 'authors'
urlpatterns = [
    path('signup/', views.Signup.as_view(), name = 'signup'),
    path('signin/', views.Signin.as_view(), name = 'signin'),
    path('authors/<uuid:author_id>',views.getOneAuthor, name = 'getoneauthor'),
    path('authors/', views.AllAuthorsView.as_view(), name = 'get-all-authors'),
    path('authors/<uuid:author_id>/followers',views.getFollowers, name = 'getfollowers'),
    path('authors/<uuid:author_id>/followers/<uuid:foreign_author_id>',views.FriendshipView.as_view(), name = 'singlefriendship'),
    path('authors/<uuid:author_id>/inbox',views.InboxView.as_view(), name = 'inbox'),
    path('authors/<uuid:author_id>/posts/', views.AllPostView.as_view(), name = 'getallposts'),
    path('authors/<uuid:author_id>/posts/<uuid:post_id>/', views.PostView.as_view(), name = 'getsinglepost'),
    path('authors/<uuid:author_id>/posts/<uuid:post_id>/comments', views.CommentView.as_view(), name='getcomment'),
    path('authors/<uuid:author_id>/posts/<uuid:post_id>/image', views.PostImageView.as_view(), name='getpostimage'),
    path('authors/<uuid:author_id>/posts/<uuid:post_id>/likes', views.LikePostView.as_view(), name='getpostlikes'),
    path('authors/<uuid:author_id>/posts/<uuid:post_id>/comments/<uuid:comment_id>/likes', views.LikeCommentView.as_view(), name='getcommentlikes'),
    path('authors/<uuid:author_id>/liked', views.LikedView.as_view(), name='getliked'),
    path('authors/<uuid:author_id>/requests', views.FollowRequestView.as_view(), name='getfollowrequests'),
]
