from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.hashers import make_password,check_password
import uuid
from django.conf import settings
from PIL import Image
import json

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
    username = models.CharField(max_length = 30, unique = True)
    uid = models.UUIDField(primary_key = True, default = uuid.uuid4, editable = False)
    displayName = models.CharField(max_length = 50, null = True,blank = True)
    github = models.URLField(max_length=255, null = True, blank = True)
    host = models.CharField(max_length=255, null = True,blank = True)
    id = models.URLField(max_length=255, null = True, blank = True)
    url = models.URLField(max_length=255, null = True, blank = True)
    is_approved = models.BooleanField(default = False)
    is_active = models.BooleanField(default = True)
    is_staff = models.BooleanField(default = False)
    is_a_node = models.BooleanField(default = False)
    #friends = models.ManyToManyField('self',blank=True,related_name='friend')
    profilePicture = models.URLField(max_length=255, null = True, blank = True)
    profilePictureImage = models.ImageField(upload_to='profilepictures/', default = 'default-profile-picture.jpg')
    USERNAME_FIELD = 'username'
    @property
    def type(self):
        return 'author'
    def save(self,*args,**kwargs):
        if self.host is None:
            self.host = settings.HOST_URL
        if self.id is None:
            self.id = f'{self.host}authors/{self.uid}'
            self.url = self.id
        super(Author,self).save(*args,**kwargs)
    objects = UserManager()

class Post(models.Model):
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='author')
    title = models.CharField(max_length=50)
    uid = models.UUIDField(default=uuid.uuid4, editable=False,primary_key=True)
    id = models.URLField(max_length=255, null = True, blank = True)
    source = models.URLField(max_length=255, null = True, blank = True)
    origin = models.URLField(max_length=255, null = True, blank = True)
    description = models.CharField(max_length=200, blank=True, null=True)
    Priv_Choices = [('PUBLIC', 'PUBLIC'), ('FRIENDS', 'FRIENDS')]
    visibility = models.CharField(max_length=20, choices=Priv_Choices, default='PUBLIC')
    # For now content is text, but set up options for content 
    content_choices = [('text/plain', 'text/plain'), ('text/markdown', 'text/markdown'), ('application/base64','application/base64'),('image/png','image/png'),('image/jpeg','image/jpeg')]
    contentType = models.CharField(max_length=20, choices=content_choices, default='text/plain')
    content = models.TextField(default='')
    #categories = models.CharField(max_length=200, blank=True, null=True)
    published = models.DateTimeField(auto_now_add=True)
    comments = models.URLField(max_length=255, null = True, blank = True)
    unlisted = models.BooleanField(default=False)
    count = models.IntegerField(default=0)
    categories = models.TextField(blank=True, null=True,default ='[]')

    def set_array(self,value):
        self.categories = json.dumps(value)
    def get_array(self):
        return json.loads(self.categories)
    @property
    def type(self):
        return 'post'
    def save(self,*args,**kwargs):
        if self.id is None:
            self.id = f'{self.author.id}/posts/{self.uid}'
        if self.source is None:
            self.source = self.id
        if self.origin is None:
            self.origin = self.id
        if self.comments is None:
            self.comments = f'{self.id}/comments'
        super(Post,self).save(*args,**kwargs)
    
    
#Not Changed    
class Comment(models.Model):
    uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, primary_key=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    comment = models.TextField()
    contentType = models.TextField()
    published = models.DateTimeField(auto_now_add=True)
    id = models.URLField(max_length=255, null = True, blank = True)
    
    @property
    def type(self):
        return 'comment'
    def save(self, *args, **kwargs):
        if self.id is None:
            self.id = f'{self.author.id}/posts/{self.post.uid}/comments/{self.uid}'
        super(Comment, self).save(*args,**kwargs)

    
class Friendship(models.Model):
    uid = models.UUIDField(default=uuid.uuid4, editable=False,primary_key=True)
    actor = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='actor')
    object = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='object')
    friend_status = [(1, 'Pending'), (2, 'Following'), (3, 'Friends')]
    status = models.SmallIntegerField(choices=friend_status, default=1)
    summary = models.CharField(max_length=200, blank=True, null=True)
    @property
    def type(self):
        return 'Follow'
#Not changed     
class Like(models.Model):
    uid = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    # Use generic content type since one can like post or comment
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField(default=uuid.uuid4, editable=False)
    content_object = GenericForeignKey('content_type', 'object_id')
    object = models.URLField(max_length=255, null = True, blank = True)
    
    @property
    def type(self):
        return 'Like'
    @property
    def summary(self):
        return f'{self.author.displayName} sent a Like'
    def save(self, *args, **kwargs):
        if self.object is None:
            self.object = self.content_object.id
        super(Like, self).save(*args,**kwargs)

    
class Inbox_Item(models.Model):
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='inbox')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    contentObject = GenericForeignKey('content_type', 'object_id')

class PostImage(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='postimages/', blank=True, null=True)
    image_url = models.URLField(max_length=255, null = True, blank = True)
    @property
    def type(self):
        return 'image'
        

    
