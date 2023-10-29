from django.test import TestCase,Client

from django.contrib.auth import get_user_model
from .models import Author, Post, Comment, Friendship
from rest_framework import status
# Create your tests here.

class CustomUserTests(TestCase):

    def test_create_user(self):
        Author = get_user_model()
        user = Author.objects.create_user(
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.assertEqual(user.username, 'will')
        self.assertFalse(user.is_approved)
        self.assertTrue(user.check_password('testpass123'))
        self.assertEqual(str(user), 'will')
        self.assertEqual(user.displayName, 'will')
    def create_superuser(self):
        Author = get_user_model()
        admin_user = Author.objects.create_superuser(
            username='superadmin',
            password='testpass123',
            displayName='superadmin',
            github='',
        )
        self.assertEqual(admin_user.username, 'superadmin')
        self.assertTrue(admin_user.is_approved)
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)
        self.assertTrue(admin_user.check_password('testpass123'))
        self.assertEqual(str(admin_user), 'superadmin')
        self.assertEqual(admin_user.display_name, 'superadmin')

class SignupTests(TestCase):
    username = 'testuser'
    password = 'testpass123'
    password2 = 'testpass123'
    wrongpassword2 = 'testpass1234'
    displayName = 'testuser'
    github = ''
    c = Client()
    def test_signup_correct(self):
        response = self.c.post('/auth/signup/', {'username': self.username, 'password': self.password, 'password2': self.password2, 'displayName': self.displayName, 'github': self.github})
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Author.objects.filter(username = self.username).exists())
    def test_signup_wrongpassword(self):
        response = self.c.post('/auth/signup/', {'username': self.username, 'password': self.password, 'password2': self.wrongpassword2, 'displayName': self.displayName, 'github': self.github})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Author.objects.filter(username = self.username).exists())
    def test_signup_sameusername(self):
        response = self.c.post('/auth/signup/', {'username': self.username, 'password': self.password, 'password2': self.password2, 'displayName': self.displayName, 'github': self.github})
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Author.objects.filter(username = self.username).exists())
        response = self.c.post('/auth/signup/', {'username': self.username, 'password': self.password, 'password2': self.password2, 'displayName': self.displayName, 'github': self.github})
        self.assertEqual(response.status_code, 400)
        self.assertTrue(Author.objects.filter(username = self.username).exists())
        
class SiginTests(TestCase):
    
    def setUp(self):
        self.author = self.author = Author.objects.create_user(
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.admin_user = Author.objects.create_superuser(
            username='superadmin',
            password='testpass123',
            displayName='superadmin',
            github='',
        )
        self.c = Client()
        
    def test_signin_correct(self):
        response = self.c.post('/auth/signin/', {'username': 'superadmin', 'password':'testpass123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('message', response.data)
        self.assertTrue('data', response.data)
        self.assertEqual(response.data['message'], 'User logged in successfully')
        
    def test_signin_fail(self):
        response = self.c.post('/auth/signin/', {'username': 'will', 'password':'testpass543'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_signin_not_approved(self):
        response = self.c.post('/auth/signin/', {'username': 'will', 'password':'testpass123'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
class PostCommentTests(TestCase):
    
    # Create an author with posts and comments on said post
    def setUp(self):
        self.author = Author.objects.create_user(
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        
        self.post = Post.objects.create(
            author=self.author,
            content='text',
            privacy='PUBLIC'
        )
        
        Comment.objects.create(
            post=self.post,
            author=self.author,
            comment='Test Comment'
        )
        
    # Test deleting posts deletes related comments
    def test_del_post_comments(self):
        # 1 Comment prior to deletion of post and 0 after
        self.assertEqual(Comment.objects.count(), 1)
        self.post.delete()
        self.assertEqual(Comment.objects.count(), 0)
        
    # Test deleting authors deletes all posts related to author
    def test_del_author_posts(self):
        # 1 Post prior to deletion of author and 0 after
        self.assertEqual(Post.objects.count(), 1)
        self.author.delete()
        self.assertEqual(Post.objects.count(), 0)
        
class FriendrequestTests(TestCase):
    
    def setUp(self):
        self.author = Author.objects.create_superuser(
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.author2 = Author.objects.create_superuser(
            username='Joe',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.c = Client()
        
    def test_send_friend_request(self):
        self.c.login(username='will', password='testpass123')
        self.assertEqual(Friendship.objects.count(), 0)
        response = self.c.post(f'/auth/frequests/send/', {'receiver_id': self.author2.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Friendship.objects.count(), 1)
        response = self.c.post(f'/auth/frequests/send/', {'receiver_id': self.author2.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_send_to_no_user(self):
        self.c.login(username='will', password='testpass123')
        self.assertEqual(Friendship.objects.count(), 0)
        response = self.c.post(f'/auth/frequests/send/', {'receiver_id': 12121122})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Friendship.objects.count(), 0)
        
    def test_respond_accept(self):
        friendship = Friendship.objects.create(sender=self.author, reciever=self.author2)
        self.c.login(username='Joe', password='testpass123')
        response = self.c.post(f'/auth/frequests/respond/{friendship.id}/', {'action': 'accept'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        friendship.refresh_from_db()
        self.assertEqual(friendship.status, 2)
        
    def test_respond_decline(self):
        friendship = Friendship.objects.create(sender=self.author, reciever=self.author2)
        self.c.login(username='Joe', password='testpass123')
        self.assertEqual(Friendship.objects.count(), 1)
        response = self.c.post(f'/auth/frequests/respond/{friendship.id}/', {'action': 'decline'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Friendship.objects.count(), 0)
        
    def test_respond_friends(self):
        friendship = Friendship.objects.create(sender=self.author2, reciever=self.author, status = 2)
        friendship = Friendship.objects.create(sender=self.author, reciever=self.author2)

        self.c.login(username='Joe', password='testpass123')
        response = self.c.post(f'/auth/frequests/respond/{friendship.id}/', {'action': 'accept'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        friendship.refresh_from_db()
        self.assertEqual(friendship.status, 3)
        
class CommentTest(TestCase):
    
    def setUp(self):
        self.author = Author.objects.create_superuser(
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.author2 = Author.objects.create_superuser(
            username='Joe',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.post = Post.objects.create(
            author=self.author,
            content='text',
            privacy='PUBLIC'
        )
        self.c = Client()
        
    def test_post_comment(self):
        self.c.login(username='Joe', password='testpass123')
        self.assertEqual(Comment.objects.count(), 0)
        response= self.c.post(f'/auth/comments/{self.post.id}/', {'comment': 'Test comment'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Comment.objects.count(), 1)
        self.assertEqual(Comment.objects.get().comment, 'Test comment')
        
    def test_post_comment_post_dne(self):
        self.c.login(username='Joe', password='testpass123')
        self.assertEqual(Comment.objects.count(), 0)
        response= self.c.post(f'/auth/comments/{500}/', {'comment': 'Test comment'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Comment.objects.count(), 0)