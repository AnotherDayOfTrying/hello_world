import io
import os
import shutil
from django.core.files.uploadedfile import InMemoryUploadedFile, SimpleUploadedFile

from django.test import TestCase,Client, override_settings
import base64
from django.contrib.auth import get_user_model
from .models import *
from rest_framework import status
from rest_framework.test import APIClient
from .serializers import *
from PIL import Image
from rest_framework.authtoken.models import Token
import json
from rest_framework.renderers import JSONRenderer
# Create your tests here.

TEST_DIR = 'test_data'

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

@override_settings(MEDIA_ROOT=TEST_DIR)
class SignupTests(TestCase):
    username = 'testuser'
    password = 'testpass123'
    password2 = 'testpass123'
    wrongpassword2 = 'testpass1234'
    displayName = 'testuser'
    github = ''
    c = Client()

    def tearDown(self):
        try:
            shutil.rmtree(TEST_DIR)
        except OSError:
            pass
    
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
    def test_signup_withimage(self):
        file = io.BytesIO()
        image = Image.new('RGBA', size=(100, 100), color=(155, 0, 0))
        image.save(file, 'png')
        file.name = 'test.png'
        file.seek(0)
        response = self.c.post('/signup/', {'username': self.username, 'password': self.password, 'password2': self.password2, 'displayName': self.displayName, 'github': self.github, 'profilePicture': file})
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Author.objects.filter(username = self.username).exists())
        
        
class SigninTests(TestCase):
    
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
        

        


class GetFollowerTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.node = Author.objects.create_user(
            username = 'node',
            password = 'testpass123',
            displayName = 'node',
            github = '',
            is_approved = False,
            is_a_node = True,
        )
        self.author1 = Author.objects.create_user(
            username='will1',
            password= 'testpass1234',
            displayName='will1',
            github='',
            is_approved = True,
        )
        self.author2 = Author.objects.create_user(
            username='will2',
            password= 'testpass1234',
            displayName='will2',
            github='',
            is_approved = True,
        )
    def test_get_no_followers_remote(self):
        userpass = f"{self.node.username}:{self.node.password}".encode("utf-8")
        userpass = base64.b64encode(userpass).decode("utf-8")
        self.client.credentials(HTTP_AUTHORIZATION = f'Basic {userpass}')
        self.response = self.client.get(f'/authors/{self.author1.uid}/followers')
        self.assertEqual(self.response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.response.data['items'], [])
    def test_get_followers_remote(self):
        userpass = f"{self.node.username}:{self.node.password}".encode("utf-8")
        userpass = base64.b64encode(userpass).decode("utf-8")
        self.client.credentials(HTTP_AUTHORIZATION = f'Basic {userpass}')
        self.friendship = Friendship.objects.create(actor=self.author2, object=self.author1, status=2)
        self.response = self.client.get(f'/authors/{self.author1.uid}/followers')
        self.assertEqual(self.response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.response.data['items'][0]['id'], str(self.author2.id))
    def test_get_no_followers_local(self):
        self.token1 = Token.objects.get_or_create(user=self.author1)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        self.response = self.client.get(f'/authors/{self.author1.uid}/followers')
        self.assertEqual(self.response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.response.data['items'], [])
    def test_get_followers_local(self):
        self.token1 = Token.objects.get_or_create(user=self.author1)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        self.friendship = Friendship.objects.create(actor=self.author2, object=self.author1, status=2)
        self.response = self.client.get(f'/authors/{self.author1.uid}/followers')
        self.assertEqual(self.response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.response.data['items'][0]['id'], str(self.author2.id))

class GetAllAuthorsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        for i in range(15):
            self.author = Author.objects.create_user(
                username=f'will{i}',
                password=f'testpass{i}',
                displayName=f'will{i}',
                github='',
                is_approved=True,
            )
        self.node = Author.objects.create_user(
            username = 'node',
            password = 'testpass123',
            displayName = 'node',
            github = '',
            is_approved = False,
            is_a_node = True,
        )
        
    
    def test_valid_pagination_authors(self):
        
    
        self.token1 = Token.objects.get_or_create(user=self.author)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        response = self.client.get('/authors/',{'page': 2, 'page_size': 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check if the response contains the expected keys
        self.assertIn('type', response.data)
        self.assertIn('items', response.data)
        self.assertIn('pagination', response.data)
        self.assertIn('next', response.data['pagination'])
        self.assertIn('previous', response.data['pagination'])
        self.assertIn('page_number', response.data['pagination'])
        self.assertIn('page_size', response.data['pagination'])

        # Check if the response has the correct number of items based on the provided page_size
        self.assertEqual(len(response.data['items']), 5)
    def test_invalid_pagination(self):
        
        self.token1 = Token.objects.get_or_create(user=self.author)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        # Make a GET request with invalid pagination parameters
        response = self.client.get('/authors/', {'page': 'invalid', 'page_size': 'invalid'})

        # Check if the response has the expected status code
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Check if the response contains the expected error message
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Invalid page or page_size parameter')
    def test_default_pagination(self):
        self.token1 = Token.objects.get_or_create(user=self.author)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        response = self.client.get('/authors/')
        # Check if the response has the expected status code
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check if the response contains the expected keys
        self.assertIn('type', response.data)
        self.assertIn('items', response.data)
        self.assertIn('pagination', response.data)
        self.assertIn('next', response.data['pagination'])
        self.assertIn('previous', response.data['pagination'])
        self.assertIn('page_number', response.data['pagination'])
        self.assertIn('page_size', response.data['pagination'])

        # Check if the response has the default number of items based on the default page_size
        self.assertEqual(len(response.data['items']), 10)
    def test_node_access(self):
        userpass = f"{self.node.username}:{self.node.password}".encode("utf-8")
        userpass = base64.b64encode(userpass).decode("utf-8")
        self.client.credentials(HTTP_AUTHORIZATION = f'Basic {userpass}')
        
        self.response = self.client.get('/authors/')
        
        self.assertEqual(self.response.status_code, status.HTTP_200_OK)

class GetOneAuthorTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.author = Author.objects.create_user(
            uid = '631f3ebe-d976-4248-a808-db2442a22168',
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.node = Author.objects.create_user(
            username = 'node',
            password = 'testpass123',
            displayName = 'node',
            github = '',
            is_approved = False,
            is_a_node = True,
        )
        self.url = reverse('authors:getoneauthor', args=[self.author.uid])
    def test_get_one_author(self):
        self.token1 = Token.objects.get_or_create(user=self.author)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        response = self.client.get(self.url)
        author = Author.objects.get(uid=self.author.uid)
        
        self.assertEqual(response.data['id'], self.author.id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    def test_update_author(self):
        data = {
            'displayName': 'will2',
        }
        self.token1 = Token.objects.get_or_create(user=self.author)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        author1 = Author.objects.get(uid=self.author.uid)
        self.assertEqual(author1.displayName, data['displayName'])
    def test_get_author_remote(self):
        userpass = f"{self.node.username}:{self.node.password}".encode("utf-8")
        userpass = base64.b64encode(userpass).decode("utf-8")
        self.client.credentials(HTTP_AUTHORIZATION = f'Basic {userpass}')
        self.response = self.client.get(self.url)
        self.assertEqual(self.response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.response.data['id'], str(self.author.id))

class FriendshipTest(TestCase):
    def setUp(self):
        self.author = Author.objects.create_user(
            uid = '631f3ebe-d976-4248-a808-db2442a22168',
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.author2 = Author.objects.create_user(
            uid = 'adbfc58a-7d07-11ee-b962-0242ac120002',
            username='Joe',
            password='testpass123',
            displayName='joe',
            github='',
        )
        self.token1 = Token.objects.get_or_create(user=self.author)
        self.node = Author.objects.create_user(
            username = 'node',
            password = 'testpass123',
            displayName = 'node',
            github = '',
            is_approved = False,
            is_a_node = True,
        )
        self.client = APIClient()
    def test_delete_friendrequest_1(self):
        '''
        Test for deleting a friend request that exists and the other author is not following the sender
        '''
        self.friend1 = Friendship.objects.create(actor=self.author2, object=self.author, status=1)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:singlefriendship', args=[self.author.uid,self.author2.uid])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Friendship.objects.count(), 0)
        self.client.credentials()
    def test_delete_friendrequest_2(self):
        '''
        Test for deleting a friend request that exists and the other author is following the sender
        '''
        self.friend1 = Friendship.objects.create(actor=self.author2, object=self.author, status=1)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        self.friend2 = Friendship.objects.create(actor=self.author, object=self.author2, status=2)
        url = reverse('authors:singlefriendship', args=[self.author.uid,self.author2.uid])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Friendship.objects.count(), 1)
        self.client.credentials()
    def test_delete_friendrequest_3(self):
        '''
        Test for deleting a friend when both are following each other
        '''
        self.friend1 = Friendship.objects.create(actor=self.author2, object=self.author, status=3)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        self.friend2 = Friendship.objects.create(actor=self.author, object=self.author2, status=3)
        url = reverse('authors:singlefriendship', args=[self.author.uid,self.author2.uid])
        response = self.client.delete(url)
        self.friend2 = Friendship.objects.get(actor=self.author, object=self.author2)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Friendship.objects.count(), 1)
        self.assertEqual(self.friend2.status, 2)
        self.client.credentials()
    def test_delete_friendrequest_4(self):
        '''
        Test for deleting a non existent friend request
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:singlefriendship', args=[self.author.uid,self.author2.uid])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 404)
    def test_check_following_1(self):
        '''
        Test for checking if an author is following another author
        '''
        self.friend1 = Friendship.objects.create(actor=self.author2, object=self.author, status=3)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:singlefriendship', args=[self.author.uid,self.author2.uid])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['is_follower'], True)
        self.client.credentials()
    def test_check_following_2(self):
        '''
        Test for checking if an author is not following another author
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:singlefriendship', args=[self.author.uid,self.author2.uid])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['is_follower'], False)
    
    def test_check_following_remote_1(self):
        '''
        Test for checking if an author is following another author through a node
        '''
        userpass = f"{self.node.username}:{self.node.password}".encode("utf-8")
        userpass = base64.b64encode(userpass).decode("utf-8")
        self.client.credentials(HTTP_AUTHORIZATION = f'Basic {userpass}')
        self.friend1 = Friendship.objects.create(actor=self.author2, object=self.author, status=3)
        url = reverse('authors:singlefriendship', args=[self.author.uid,self.author2.uid])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['is_follower'], True)
        self.client.credentials()
    
    def test_check_following_remote_2(self):
        '''
        Test for checking if an author is following another author through a node
        '''
        userpass = f"{self.node.username}:{self.node.password}".encode("utf-8")
        userpass = base64.b64encode(userpass).decode("utf-8")
        self.client.credentials(HTTP_AUTHORIZATION = f'Basic {userpass}')
        url = reverse('authors:singlefriendship', args=[self.author.uid,self.author2.uid])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['is_follower'], False)
        self.client.credentials()

    def test_adding_a_friend_1(self):
        '''
        Test for adding a friend when the other author is not following the sender
        '''

        self.friend1 = Friendship.objects.create(actor=self.author2, object=self.author, status=1)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        
        url = reverse('authors:singlefriendship', args=[self.author.uid,self.author2.uid])
        response = self.client.put(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Friendship.objects.get(actor=self.author2, object=self.author).status, 2)
        self.client.credentials()
    def test_adding_a_friend_2(self):
        '''
        Test for adding a friend when the other author is following the sender
        '''

        self.friend1 = Friendship.objects.create(actor=self.author2, object=self.author, status=1)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        self.friend2 = Friendship.objects.create(actor=self.author, object=self.author2, status=2)
        url = reverse('authors:singlefriendship', args=[self.author.uid,self.author2.uid])
        response = self.client.put(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Friendship.objects.get(actor=self.author2, object=self.author).status, 3)
        self.assertEqual(Friendship.objects.get(actor=self.author, object=self.author2).status, 3)
        self.client.credentials()
    def test_adding_a_friend_3(self):
        '''
        Test for adding a friend when the oher author is already a friend
        '''
        self.friend1 = Friendship.objects.create(actor=self.author2, object=self.author, status=2)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        
        url = reverse('authors:singlefriendship', args=[self.author.uid,self.author2.uid])
        response = self.client.put(url)
        self.assertEqual(response.status_code, 400)
    def test_adding_a_friend_4(self):
        '''
        Test for adding a friend when there is no friend request
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:singlefriendship', args=[self.author.uid,self.author2.uid])
        response = self.client.put(url)
        self.assertEqual(response.status_code, 404)
class InboxTest(TestCase):
    def setUp(self):
        self.author = Author.objects.create_user(
            uid = '631f3ebe-d976-4248-a808-db2442a22168',
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.author2 = Author.objects.create_user(
            uid = 'adbfc58a-7d07-11ee-b962-0242ac120002',
            username='Joe',
            password='testpass123',
            displayName='joe',
            github='',
        )
        self.token1 = Token.objects.get_or_create(user=self.author)
        self.node = Author.objects.create_user(
            username = 'node',
            password = 'testpass123',
            displayName = 'node',
            github = '',
            is_approved = False,
            is_a_node = True,
        )
        self.client = APIClient()
        self.post = Post.objects.create(
            uid = '631f3ebe-d976-4248-a808-db2442a22168',
            author = self.author,
            title = 'testing',
            description = 'testing',
            contentType = 'text/plain',
            content = 'testing',
            categories = '[]',
            visibility = 'PUBLIC',
            unlisted = False,
        )
        self.comment = Comment.objects.create(
            author = self.author,
            comment = 'testing the inbox',
            contentType = 'text/plain',
            post = self.post
        )
    def test_create_friendrequest_1(self):
        '''
        Test to send a friend request to an author that exists and is not a friend
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url1 = reverse('authors:getoneauthor', args=[self.author.uid])
        url2 = reverse('authors:getoneauthor', args=[self.author2.uid])
        response1 = self.client.get(url1)
        response2 = self.client.get(url2)
        url = reverse('authors:inbox', args=[self.author2.uid])
        payload = {
        'type': 'Follow',
        'summary': f'{self.author.displayName} wants to follow you',
        'actor': response1.data,
        'object': response2.data,
        }
        response = self.client.post(url, json.dumps(payload),content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Friendship.objects.count(), 1)
        self.assertEqual(Friendship.objects.get().status, 1)
        self.assertEqual(Friendship.objects.get().actor.id, self.author.id)
        self.assertEqual(Friendship.objects.get().object.id, self.author2.id)
        self.assertEqual(Inbox_Item.objects.count(), 1)
        self.client.credentials()
    def test_create_friendrequest_2(self):
        '''
        Test to send a friend request to an author that exists and is a friend
        '''
        self.friends = Friendship.objects.create(actor=self.author2, object=self.author, status=2)

        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url1 = reverse('authors:getoneauthor', args=[self.author.uid])
        url2 = reverse('authors:getoneauthor', args=[self.author2.uid])

        response1 = self.client.get(url1)
        response2 = self.client.get(url2)
        url = reverse('authors:inbox', args=[self.author2.uid])
        payload = {
        'type': 'Follow',
        'summary': f'{self.author.displayName} wants to follow you',
        'actor': response1.data,
        'object': response2.data,
        }
        response = self.client.post(url, json.dumps(payload),content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Friendship.objects.count(), 2)
        self.assertEqual(Friendship.objects.get(actor = self.author, object = self.author2).status, 1)
        self.assertEqual(Inbox_Item.objects.count(), 1)
        self.assertEqual(Friendship.objects.get(actor = self.author2, object = self.author).status,2)
        self.client.credentials()
    def test_create_friendrequest_3(self):
        '''
        Test to send a request of some sort to an invalid author
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url1 = reverse('authors:inbox', args=['adbfc58a-7d07-11ee-b962-0242ac120003'])
        response = self.client.post(url1)
        self.assertEqual(response.status_code, 404)
    
    def test_sharing_post_1(self):
        
        url1 = reverse('authors:getsinglepost', args=[self.author.uid,self.post.uid])
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        response = self.client.get(url1)
        url = reverse('authors:inbox', args=[self.author2.uid])
        response = self.client.post(url,response.data, format='json') 
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Inbox_Item.objects.count(), 1)
        self.assertEqual(Inbox_Item.objects.get().content_type, ContentType.objects.get_for_model(Post))
        self.assertEqual(Post.objects.count(), 1)

        response2 = self.client.get(url)
        self.assertEqual(response2.status_code, 200)
        response3 = self.client.delete(url)
        self.assertEqual(response3.status_code, 204)
        self.assertEqual(Inbox_Item.objects.count(), 0)

class PostTest(TestCase):
    def setUp(self):
        self.author = Author.objects.create_user(
            uid = '631f3ebe-d976-4248-a808-db2442a22168',
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.author2 = Author.objects.create_user(
            uid = 'adbfc58a-7d07-11ee-b962-0242ac120002',
            username='Joe',
            password='testpass123',
            displayName='joe',
            github='',
        )
        self.token1 = Token.objects.get_or_create(user=self.author)
        self.node = Author.objects.create_user(
            username = 'node',
            password = 'testpass123',
            displayName = 'node',
            github = '',
            is_approved = False,
            is_a_node = True,
        )

        self.post = Post.objects.create(
            uid = '631f3ebe-d976-4248-a808-db2442a22168',
            author = self.author,
            title = 'testing',
            description = 'testing',
            contentType = 'text/plain',
            content = 'testing',
            categories = '[]',
            visibility = 'PUBLIC',
            unlisted = False,
        )
        
        self.client = APIClient()
    def test_delete_post_1(self):
        '''
        Test for deleting a post that exists
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getsinglepost', args=[self.author.uid,self.post.uid])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Post.objects.count(), 0)
        self.client.credentials()
    def test_delete_post_2(self):
        '''
        Test for deleting a post that does not exist
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getsinglepost', args=[self.author.uid,'631f3ebe-d976-4248-a808-db2442a22169'])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 404)
        self.client.credentials()
    def test_get_post_1(self):
        '''
        Test for getting a post that exists
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getsinglepost', args=[self.author.uid,self.post.uid])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], str(self.post.id))
        self.client.credentials()
    def test_get_post_2(self):
        '''
        Test for getting a post that does not exist
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getsinglepost', args=[self.author.uid,'631f3ebe-d976-4248-a808-db2442a22169'])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)
        self.client.credentials()
    def test_get_post_3(self):
        '''
        Test for getting a post that exists but is not public
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        self.post.visibility = 'PRIVATE'
        self.post.save()
        url = reverse('authors:getsinglepost', args=[self.author.uid,self.post.uid])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)
        self.client.credentials()
    def test_delete_post_1(self):
        '''
        Test for deleting a post that exists
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getsinglepost', args=[self.author.uid,self.post.uid])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Post.objects.count(), 0)
    def test_delete_post_2(self):
        '''
        Test for deleting a post that does not exist
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getsinglepost', args=[self.author.uid,'631f3ebe-d976-4248-a808-db2442a22169'])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 404)
    
    def test_put_post_1(self):
        '''
        Test for creating a post that already exist
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getsinglepost', args=[self.author.uid,self.post.uid])
        response = self.client.put(url)
        self.assertEqual(response.status_code, 400)
    def test_put_post_2(self):
        '''
        Test for creating a post that does not yet exist
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        
        
        url2 = reverse('authors:getoneauthor', args=[self.author.uid])
        url = reverse('authors:getsinglepost', args=[self.author.uid,'631f3ebe-d976-4248-a808-db2442a22169'])
        response = self.client.get(url2)
        payload = {
        'title': 'testing',
        'description': 'testing',
        'contentType': 'text/plain',
        'content': 'testing',
        'categories': '[]',
        'visibility': 'PUBLIC',
        'unlisted': False,
        'author': response.data,
        }
        response = self.client.put(url, json.dumps(payload),content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Post.objects.count(), 2)
        self.client.credentials()
    def test_put_post_3(self):
        '''
        Test for creating a post but it has one or more fields missing
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        
        
        url2 = reverse('authors:getoneauthor', args=[self.author.uid])
        url = reverse('authors:getsinglepost', args=[self.author.uid,'631f3ebe-d976-4248-a808-db2442a22169'])
        response = self.client.get(url2)
        payload = {
        'title': 'testing',
        'description': 'testing',
        'contentType': 'text/plain',
        'content': 'testing',
        'categories': '[]',
        
        'unlisted': False,
        
        }
        response = self.client.put(url, json.dumps(payload),content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Post.objects.count(), 1)
        self.client.credentials()        

    def test_put_post_4(self):
        '''
        Test for creating a post but content type is not valid
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url2 = reverse('authors:getoneauthor', args=[self.author.uid])
        url = reverse('authors:getsinglepost', args=[self.author.uid,'631f3ebe-d976-4248-a808-db2442a22169'])
        response = self.client.get(url2)
        payload = {
        'title': 'testing',
        'description': 'testing',
        'contentType': 'asd',
        'content': 'testing',
        'categories': '[]',
        'visibility': 'PUBLIC',
        'unlisted': False,
        'author': response.data,
        }
        response = self.client.put(url, json.dumps(payload),content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Post.objects.count(), 1)
        self.client.credentials()
    def test_post_post_1(self):
        '''
        Test for editing a post that is not yours
        '''
        self.post = Post.objects.create(
            uid = '631f3ebe-d976-4248-a808-db2442a22178',
            author = self.author2,
            title = 'testing',
            description = 'testing',
            contentType = 'text/plain',
            content = 'testing',
            categories = '[]',
            visibility = 'PUBLIC',
            unlisted = False,
        )
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getsinglepost', args=[self.author2.uid,self.post.uid])
        response = self.client.post(url)
        self.assertEqual(response.status_code, 403)
        self.client.credentials()
    def test_post_post_2(self):
        '''
        Test for editing a post that is yours
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getsinglepost', args=[self.author.uid,self.post.uid])
        
        payload = {
        'title': 'testing2',
        'description': 'testing',
        'contentType': 'text/plain',
        'content': 'testing',
        'categories': '[]',
        'visibility': 'PUBLIC',
        'unlisted': False,
        
        }
        response = self.client.post(url, json.dumps(payload),content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Post.objects.count(), 1)
        self.assertEqual(Post.objects.get().title, 'testing2')
        self.client.credentials()

class AllPostTest(TestCase):
    def setUp(self):
        self.author = Author.objects.create_user(
            uid = '631f3ebe-d976-4248-a808-db2442a22168',
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        
        self.token1 = Token.objects.get_or_create(user=self.author)
        
        self.client = APIClient()
        self.post = Post.objects.create(
            uid = '631f3ebe-d976-4248-a808-db2442a22168',
            author = self.author,
            title = 'testing',
            description = 'testing',
            contentType = 'text/plain',
            content = 'testing',
            categories = '[]',
            visibility = 'PUBLIC',
            unlisted = False,
        )
    def test_get_all_posts_1(self):
        '''
        Test for getting all posts from an author that exists
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getallposts', args=[self.author.uid])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['items']), 1)
        self.client.credentials()
    def test_get_all_posts_2(self):
        '''
        Test for getting all posts from an author that does not exist
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getallposts', args=['631f3ebe-d976-4248-a808-db2442a22169'])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)
        self.client.credentials()
    def test_post_all_posts_1(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url2 = reverse('authors:getoneauthor', args=[self.author.uid])
        url = reverse('authors:getallposts', args=[self.author.uid])
        response = self.client.get(url2)
        payload = {
            'title': 'testing',
            'description': 'testing',
            'contentType': 'text/plain',
            'content': 'testing',
            'categories': '[]',
            'visibility': 'PUBLIC',
            'unlisted': False,
            'author': response.data,
        }
        response = self.client.post(url, json.dumps(payload),content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Post.objects.count(), 2)

class CommentTest(TestCase):
    def setUp(self):
        self.author = Author.objects.create_user(
            uid = '631f3ebe-d976-4248-a808-db2442a22168',
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )

        self.token1 = Token.objects.get_or_create(user=self.author)

        self.client = APIClient()
        self.post = Post.objects.create(
            uid = '631f3ebe-d976-4248-a808-db2442a22168',
            author = self.author,
            title = 'testing',
            description = 'testing',
            contentType = 'text/plain',
            content = 'testing',
            categories = '[]',
            visibility = 'PUBLIC',
            unlisted = False,
        )


    def test_post_and_get_comment(self):
        '''
        Test for posting a comment on a post
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)


        url = reverse('authors:getcomment', args=[self.author.uid, self.post.uid])
        url2 = reverse('authors:getoneauthor', args=[self.author.uid])

        response1 = self.client.get(url2)
        
        payload = {
        'author' : response1.data,
        'comment' : 'testing comment',
        'contentType' : 'text/markdown',
        }
        response2 = self.client.post(url, json.dumps(payload),content_type='application/json')
        self.assertEqual(response2.status_code, 201)
        self.assertEqual(Comment.objects.count(), 1)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        url = reverse('authors:inbox', args=[self.author.uid])
        response3 = self.client.post(url, json.dumps(response2.data), content_type='application/json')
        print(response3.data)
        self.assertEqual(response3.status_code, 201)
        self.assertEqual(Comment.objects.count(), 1)
        self.assertEqual(Inbox_Item.objects.count(), 1)
        self.assertEqual(Comment.objects.get().comment, 'testing comment')
        self.client.credentials()
class PostImageTest(TestCase):
    def setUp(self):
        self.author = Author.objects.create_superuser(
            uid = '631f3ebe-d976-4248-a808-db2442a22168',
            username='will',
            password='testpass123',
            displayName='will',
            github='',
        )
        self.post = Post.objects.create(
            uid = '631f3ebe-d976-4248-a808-db2442a22168',
            author = self.author,
            title = 'testing',
            description = 'testing',
            contentType = 'text/plain',
            content = 'testing',
            categories = '[]',
            visibility = 'PUBLIC',
            unlisted = False,
        )
        
        
        
        self.c = APIClient()
        self.token1 = Token.objects.get_or_create(user=self.author)
    
    def test_get_post_image_1(self):
        '''
        Test for an post with no image
        '''
        self.c.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getpostimage', args=[self.author.uid, self.post.uid])
        response = self.c.get(url)
        
        self.assertEqual(response.status_code, 404)
        self.assertIn(response.data['error'],  'no image')
    
    def test_get_post_image_2(self):
        '''
        Test for getting an image that exists
        '''
        img = Image.open('./media/postpicture1.jpg')
        output = io.BytesIO()
        img.save(output, format='JPEG',quality = 60)
        file = InMemoryUploadedFile(output, 'ImageField', "postpicture2.jpg", 'image/jpeg', output.getbuffer().nbytes, None)
        self.post_image = PostImage.objects.create(
            post = self.post,
            image = file,
        )
        
        self.c.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getpostimage', args=[self.author.uid, self.post.uid])
        response = self.c.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('http://testserver/media/postimages/postpicture2',response.data['image_url'] )
    def test_delete_post_image_1(self):
        img = Image.open('./media/postpicture1.jpg')
        output = io.BytesIO()
        img.save(output, format='JPEG',quality = 60)
        file = InMemoryUploadedFile(output, 'ImageField', "postpicture2.jpg", 'image/jpeg', output.getbuffer().nbytes, None)
        self.post_image = PostImage.objects.create(
            post = self.post,
            image = file,
        )
        self.c.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getpostimage', args=[self.author.uid, self.post.uid])
        response = self.c.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(PostImage.objects.count(), 0)
    def test_delete_post_image_2(self):
        self.c.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getpostimage', args=[self.author.uid, self.post.uid])
        response = self.c.delete(url)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(PostImage.objects.count(), 0)
    def test_post_post_image_1(self):
        '''
        Test for posting an image
        '''
        self.c.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getpostimage', args=[self.author.uid, self.post.uid])
        with open('./media/postpicture1.jpg', 'rb') as f:
            payload = {
                'image': f,
            }
            response = self.c.post(url, payload)
        print(response.data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(PostImage.objects.count(), 1)
        
        
    def test_post_post_image_2(self):
        '''
        Test for changing a post's image
        '''
        self.c.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        img = Image.open('./media/2.jpg')
        output = io.BytesIO()
        img.save(output, format='JPEG',quality = 60)
        file = InMemoryUploadedFile(output, 'ImageField', "2.jpg", 'image/jpeg', output.getbuffer().nbytes, None)
        self.post_image = PostImage.objects.create(
            post = self.post,
            image = file,
        )
        url = reverse('authors:getpostimage', args=[self.author.uid, self.post.uid])
        with open('./media/postpicture1.jpg', 'rb') as f:
            payload = {
                'image': f,
            }
            response = self.c.post(url, payload)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(PostImage.objects.count(), 1)
        self.assertEqual('Updated Image Successfully',response.data )
        self.c.credentials()

class LikeTest(TestCase):
    def setUp(self):
            self.author = Author.objects.create_user(
                uid = '631f3ebe-d976-4248-a808-db2442a22168',
                username='will',
                password='testpass123',
                displayName='will',
                github='',
            )
            self.author2 = Author.objects.create_user(
                uid = 'adbfc58a-7d07-11ee-b962-0242ac120002',
                username='Joe',
                password='testpass123',
                displayName='joe',
                github='',
            )
            self.token1 = Token.objects.get_or_create(user=self.author)
            self.node = Author.objects.create_user(
                username = 'node',
                password = 'testpass123',
                displayName = 'node',
                github = '',
                is_approved = False,
                is_a_node = True,
            )
            self.post = Post.objects.create(
                uid = '631f3ebe-d976-4248-a808-db2442a22168',
                author = self.author,
                title = 'testing',
                description = 'testing',
                contentType = 'text/plain',
                content = 'testing',
                categories = '[]',
                visibility = 'PUBLIC',
                unlisted = False,
            )
            self.comment = Comment.objects.create(
                author = self.author,
                comment = 'testing the inbox',
                contentType = 'text/plain',
                post = self.post,
            )
            self.client = APIClient()
    def test_create_like(self):
        '''
        Test to send a friend request to an author that exists and is not a friend
        '''
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url1 = reverse('authors:getoneauthor', args=[self.author.uid])
        url2 = reverse('authors:getoneauthor', args=[self.author2.uid])
        response1 = self.client.get(url1)
        response2 = self.client.get(url2)
        url = reverse('authors:inbox', args=[self.author2.uid])
        payload = {
        'type': 'Like',
        'author': response1.data,
        'object': self.post.id,
        }
        response = self.client.post(url, json.dumps(payload),content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Like.objects.count(), 1)
        self.assertEqual(Like.objects.get().author.id, self.author.id)
        self.assertEqual(str(Like.objects.get().object_id), self.post.uid)
        self.assertEqual(Inbox_Item.objects.count(), 1)
        url3 = reverse('authors:getpostlikes', args=[self.author.uid, self.post.uid])
        response = self.client.get(url3)
        self.assertEqual(response.status_code, 201)


        payload = {
        'type': 'Like',
        'author': response1.data,
        'object': self.comment.id,
        }
        response = self.client.post(url, json.dumps(payload),content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Like.objects.count(), 2)
        self.assertEqual(Like.objects.get(object_id=self.comment.uid).object_id, self.comment.uid)
        self.assertEqual(Inbox_Item.objects.count(), 2)
        url3 = reverse('authors:getcommentlikes', args=[self.author.uid, self.post.uid, self.comment.uid])
        response = self.client.get(url3)
        self.assertEqual(response.status_code, 201)


        url4 = reverse('authors:getliked', args=[self.author.uid])
        response = self.client.get(url4)
        print(response.data)
        self.assertEqual(response.status_code, 200)
        self.client.credentials()
        
class NodeTest(TestCase):
    
    def setUp(self):
        self.client = APIClient()
        self.author = Author.objects.create_user(
                uid = '631f3ebe-d976-4248-a808-db2442a22168',
                username='will',
                password='testpass123',
                displayName='will',
                github='',
            )
        self.token1 = Token.objects.get_or_create(user=self.author)
        
    def test_setup(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1[0].key)
        url = reverse('authors:getnodeauthors')
        response = self.client.get(url)
        #print(response.data)
        self.assertEqual(response.status_code, 200)
        print(Post.objects.count())
        print(PostImage.objects.count())
        self.client.credentials()
        