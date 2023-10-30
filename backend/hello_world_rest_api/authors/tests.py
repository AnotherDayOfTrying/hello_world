from django.test import TestCase,Client

from django.contrib.auth import get_user_model
from .models import *
from rest_framework import status
from rest_framework.test import APIClient
from .serializers import *
from PIL import Image
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
        response = self.c.post('/signup/', {'username': self.username, 'password': self.password, 'password2': self.password2, 'displayName': self.displayName, 'github': self.github})
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Author.objects.filter(username = self.username).exists())
    def test_signup_wrongpassword(self):
        response = self.c.post('/signup/', {'username': self.username, 'password': self.password, 'password2': self.wrongpassword2, 'displayName': self.displayName, 'github': self.github})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Author.objects.filter(username = self.username).exists())
    def test_signup_sameusername(self):
        response = self.c.post('/signup/', {'username': self.username, 'password': self.password, 'password2': self.password2, 'displayName': self.displayName, 'github': self.github})
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Author.objects.filter(username = self.username).exists())
        response = self.c.post('/signup/', {'username': self.username, 'password': self.password, 'password2': self.password2, 'displayName': self.displayName, 'github': self.github})
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
        response = self.c.post('/signin/', {'username': 'superadmin', 'password':'testpass123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('message', response.data)
        self.assertTrue('data', response.data)
        self.assertEqual(response.data['message'], 'User logged in successfully')
        
    def test_signin_fail(self):
        response = self.c.post('/signin/', {'username': 'will', 'password':'testpass543'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_signin_not_approved(self):
        response = self.c.post('/signin/', {'username': 'will', 'password':'testpass123'})
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
            text='text',
            privacy='PUBLIC'
        )
        
        self.comment = Comment.objects.create(
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
        response = self.c.post(f'/frequests/send/', {'receiver_id': self.author2.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Friendship.objects.count(), 1)
        response = self.c.post(f'/frequests/send/', {'receiver_id': self.author2.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_send_to_no_user(self):
        self.c.login(username='will', password='testpass123')
        self.assertEqual(Friendship.objects.count(), 0)
        response = self.c.post(f'/frequests/send/', {'receiver_id': 12121122})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Friendship.objects.count(), 0)
        
    def test_respond_accept(self):
        friendship = Friendship.objects.create(sender=self.author, reciever=self.author2)
        self.c.login(username='Joe', password='testpass123')
        response = self.c.post(f'/frequests/respond/{friendship.id}/', {'action': 'accept'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        friendship.refresh_from_db()
        self.assertEqual(friendship.status, 2)
        
    def test_respond_decline(self):
        friendship = Friendship.objects.create(sender=self.author, reciever=self.author2)
        self.c.login(username='Joe', password='testpass123')
        self.assertEqual(Friendship.objects.count(), 1)
        response = self.c.post(f'/frequests/respond/{friendship.id}/', {'action': 'decline'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Friendship.objects.count(), 0)
        
    def test_respond_friends(self):
        friendship = Friendship.objects.create(sender=self.author2, reciever=self.author, status = 2)
        friendship2 = Friendship.objects.create(sender=self.author, reciever=self.author2)

        self.c.login(username='Joe', password='testpass123')
        response = self.c.post(f'/frequests/respond/{friendship2.id}/', {'action': 'accept'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        friendship.refresh_from_db()
        self.assertEqual(friendship.status, 3)
        
    def test_delete_friend(self):
        friendship = Friendship.objects.create(sender=self.author2, reciever=self.author, status = 3)
        friendship2 = Friendship.objects.create(sender=self.author, reciever=self.author2, status = 3)
        self.c.login(username='Joe', password='testpass123')
        response = self.c.post(f'/frequests/delete/{friendship2.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Friendship.objects.count(), 1)
        friendship.refresh_from_db()
        self.assertEqual(friendship.status, 2)
        
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
            text='text',
            privacy='PUBLIC'
        )
        self.c = Client()
        
    def test_post_comment(self):
        self.c.login(username='Joe', password='testpass123')
        self.assertEqual(Comment.objects.count(), 0)
        response= self.c.post(f'/comments/{self.post.id}/', {'comment': 'Test comment'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Comment.objects.count(), 1)
        self.assertEqual(Comment.objects.get().comment, 'Test comment')
        self.assertEqual(Comment.objects.get().author, self.author2)
        self.assertEqual(Comment.objects.get().post.author, self.author)
        
        
        
    def test_post_comment_post_dne(self):
        self.c.login(username='Joe', password='testpass123')
        self.assertEqual(Comment.objects.count(), 0)
        response= self.c.post(f'/comments/{500}/', {'comment': 'Test comment'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Comment.objects.count(), 0)

class GetAllAuthorsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.author = Author.objects.create_user(
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.author2 = Author.objects.create_user(
            username='Joe',
            password='testpass123',
            displayName='will',
            github='',
        )
    
    def test_get_all_authors(self):
        response = self.client.get('/authors/')
        authors = Author.objects.all()
        serializer = AuthorSerializer(authors, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {
            "type": "authors",
            "items": serializer.data
        })

class GetOneAuthorTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.author = Author.objects.create_user(
            id = '631f3ebe-d976-4248-a808-db2442a22168',
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.url = reverse('authors:getoneauthor', args=[self.author.id])
    def test_get_one_author(self):
        response = self.client.get(self.url)
        author = Author.objects.get(id=self.author.id)
        serializer = AuthorSerializer(author)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    def test_update_author(self):
        data = {
            'displayName': 'will2',
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        author1 = Author.objects.get(id=self.author.id)
        self.assertEqual(author1.displayName, data['displayName'])
          
class GetFriendRequestsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.author = Author.objects.create_user(
            id = '631f3ebe-d976-4248-a808-db2442a22168',
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.author2 = Author.objects.create_user(
            username='Joe',
            password='testpass123',
            displayName='joe',
            github='',
        )
        self.friendship = Friendship.objects.create(sender=self.author2, reciever=self.author)
    def test_get_friend_requests(self):
        url = reverse('authors:getfriendrequests', args=[self.author.id])
        response = self.client.get(url)
        friendships = Friendship.objects.filter(reciever=self.author, status=1)
        serializer = FriendShipSerializer(friendships, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)
        
        
class LikingTests(TestCase):
    
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
            text='text',
            privacy='PUBLIC'
        )
        self.comment = Comment.objects.create(
            post=self.post,
            author=self.author2,
            comment='Test Comment'
        )
        
        self.c = Client()
        
    def test_like_post(self):
        self.c.login(username='Joe', password='testpass123')
        self.assertEqual(Like.objects.count(), 0)
        response= self.c.post(f'/likes/', {'content_type': 'post', 'content_id': self.post.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Like.objects.count(), 1)
        self.assertEqual(Like.objects.get().liker, self.author2)
        self.assertEqual(Like.objects.get().content_object, self.post)
        
    def test_like_comment(self):
        self.c.login(username='will', password='testpass123')
        self.assertEqual(Like.objects.count(), 0)
        response= self.c.post(f'/likes/', {'content_type': 'comment', 'content_id': self.comment.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Like.objects.count(), 1)
        self.assertEqual(Like.objects.get().liker, self.author)
        self.assertEqual(Like.objects.get().content_object, self.comment)
        
    def test_unliking(self):
        self.c.login(username='Joe', password='testpass123')
        self.assertEqual(Like.objects.count(), 0)
        response= self.c.post(f'/likes/', {'content_type': 'post', 'content_id': self.post.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Like.objects.count(), 1)
        response=self.c.post(f'/unlike/{Like.objects.get().id}/')
        self.assertEqual(Like.objects.count(), 0)

class PostTest(TestCase):
    def setUp(self):
        self.author = Author.objects.create_superuser(
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.title1='coding'
        self.title2='warriors'
        self.content_type1='TEXT'
        self.content_type2='IMAGE'
        self.privcay = 'PUBLIC'
        self.wrong_content_type = 'RANDOM'
        self.text1='Hello World'
        self.text2='Goodbye World'
        self.image_url1 = 'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        self.image_url2 = 'https://images.pexels.com/photos/757889/pexels-photo-757889.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        self.image = Image.open('./media/postimages/postpicture1.jpg')
        self.c = Client()
    
    def test_upload_post_success(self):
        self.c.login(username='will', password='testpass123')
        response = self.c.post(f'/post/upload/', {'title': self.title1, 'content_type': self.content_type1, 'privacy': self.privcay, 'text': self.text1, 'image_url': self.image_url1, 'image': ''})
        self.assertEqual(response.data['data']['title'], self.title1)
        self.assertEqual(response.status_code, 200)

    def test_upload_post_fail(self):
        self.c.login(username='will', password='testpass123')
        response = self.c.post(f'/post/upload/', {'title': self.title1, 'content_type': self.wrong_content_type, 'privacy': self.privcay, 'text': self.text1, 'image_url': self.image_url1, 'image': ''})
        self.assertEqual(response.status_code, 400)

    def test_update_post_success(self):
        self.c.login(username='will', password='testpass123')
        response = self.c.post(f'/post/edit/', {'title': self.title2, 'content_type': self.content_type2, 'text': self.text2})
        self.assertEqual(response.data['data']['title'], self.title2)
        self.assertEqual(response.data['data']['content_type'], self.content_type2)
        self.assertEqual(response.data['data']['text'], self.text2)
        self.assertEqual(response.status_code, 200)
        response = self.c.post(f'/post/edit/', {'image_url': self.image_url2})
        self.assertEqual(response.data['data']['image_url'], self.image_url2)
        self.assertEqual(response.status_code, 200)

    def test_delete_post_success(self):
        self.c.login(username='will', password='testpass123')
        self.assertEqual(Post.objects.count(), 0)
        response = self.c.post(f'/post/upload/', {'title': self.title1, 'content_type': self.content_type1, 'privacy': self.privcay, 'text': self.text1, 'image_url': self.image_url1, 'image': ''})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Post.objects.count(), 1)
        response=self.c.delete(f'/post/delete/{Post.objects.get().id}/')
        self.assertEqual(Post.objects.count(), 0)