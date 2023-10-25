from django.test import TestCase,Client

from django.contrib.auth import get_user_model
from .models import Author, Post, Comment
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
    def del_post_comments(self):
        # 1 Comment prior to deletion of post and 0 after
        self.assertEqual(Comment.objects.count(), 1)
        self.post.delete()
        self.assertEqual(Comment.objects.count(), 0)
        
    # Test deleting authors deletes all posts related to author
    def del_author_posts(self):
        # 1 Post prior to deletion of author and 0 after
        self.assertEqual(Post.objects.count(), 1)
        self.author.delete()
        self.assertEqual(Post.objects.count(), 0)
        