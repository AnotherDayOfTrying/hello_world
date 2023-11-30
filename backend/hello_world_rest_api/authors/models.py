from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.hashers import make_password,check_password
import uuid
from django.conf import settings
from PIL import Image



# Create your models here.
class UserManager(BaseUserManager):
    def create_user(self, username, password = None, displayName = None, github = None, **otherfields):
        if not username:
            raise ValueError("Users must have a username")
        if not password:
            raise ValueError("Users must have a password")
        user = self.model(username = username, displayName = displayName, github = github, **otherfields)
        user.set_password(password)
        
        user.save()
        return user
    def create_superuser(self, username, password, **other_fields):
        other_fields.setdefault('is_staff', True)
        other_fields.setdefault('is_superuser', True)
        other_fields.setdefault('is_active', True)
        other_fields.setdefault('is_approved', True)
        #other_fields.setdefault('is_a_node', True)
        if other_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if other_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(username, password, **other_fields)

class Author(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length = 20, unique = True)
    id = models.UUIDField(primary_key = True, default = uuid.uuid4, editable = False)
    displayName = models.CharField(max_length = 50, null = True,blank = True)
    github = models.URLField(max_length=255, null = True, blank = True)
    host = models.CharField(max_length=255, default = settings.HOST_URL)
    url = models.URLField(default = settings.HOST_URL + "authors/" + str(id))
    is_approved = models.BooleanField(default = False)
    is_active = models.BooleanField(default = True)
    is_staff = models.BooleanField(default = False)
    is_a_node = models.BooleanField(default = False)
    #friends = models.ManyToManyField('self',blank=True,related_name='friend')
    profilePicture = models.ImageField(upload_to='profilepictures/', default = 'default-profile-picture.jpg')
    USERNAME_FIELD = 'username'
    def __str__(self):
        return self.username
    @property
    def type(self):
        return "author"
    def url(self):
        return self.host + "authors/" + str(self.id)
    objects = UserManager()

class Post(models.Model):
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    description = models.CharField(max_length=255)
    content = models.TextField()
    Priv_Choices = [('PUBLIC', 'Public'), ('UNLISTED', 'Unlisted'), ('PRIVATE', 'Private')]
    privacy = models.CharField(max_length=10, choices=Priv_Choices, default='PUBLIC')
    # For now content is text, but set up options for content 
    content_choices = [('TEXT', 'Text'), ('IMAGE', 'Image')]
    content_type = models.CharField(max_length=10, choices=content_choices, default='TEXT')
    text = models.CharField(max_length=200, blank=True, null=True)
    image_url = models.URLField(max_length=200, blank=True, null=True)
    image = models.ImageField(upload_to='postimages/', blank=True, null=True)
    published = models.DateTimeField(auto_now_add=True)
    
    @property
    def post_prime_key(self):
        return f'{settings.HOST_URL}/authors/{self.author.id}/posts/{self.uid}'
    
    @property
    def post_source(self):
        return f'{settings.HOST_URL}/authors/{self.author.id}/posts/{self.uid}'
    
    @property
    def post_origin(self):
        return f'{settings.HOST_URL}/authors/{self.author.id}/posts/{self.uid}'
    
class Comment(models.Model):
    uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    comment = models.TextField()
    contentType = models.TextField()
    published = models.DateTimeField(auto_now_add=True)
    
    @property
    def post_prime_key(self):
        return f'{settings.HOST_URL}/authors/{self.author.id}/posts/{self.post.uid}/comments/{self.uid}'
    
class Friendship(models.Model):
    sender = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='sender')
    reciever = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='reciever')
    friend_status = [(1, 'Pending'), (2, 'Following'), (3, 'Friends')]
    status = models.SmallIntegerField(choices=friend_status, default=1)
    
class Like(models.Model):
    liker = models.ForeignKey(Author, on_delete=models.CASCADE)
    # Use generic content type since one can like post or comment
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    @property
    def post_prime_key(self):
        return f'{settings.HOST_URL}/authors/{self.liker.id}/posts/{self.content_object.uid}'


    
