from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
import uuid

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
    host = models.CharField(max_length=255, blank = True)
    url = models.URLField(max_length=255, blank = True)
    is_approved = models.BooleanField(default = False)
    is_active = models.BooleanField(default = True)
    is_staff = models.BooleanField(default = False)
    friends = models.ManyToManyField('self',blank=True,related_name='friend')
    
    USERNAME_FIELD = 'username'
    def __str__(self):
        return self.username
    @property
    def url(self):
        return self.host + "authors/" + str(self.id)
    objects = UserManager()
    
class Post(models.Model):
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    Priv_Choices = [('PUBLIC', 'Public'), ('FRIENDS', 'Friends Only'), ('PRIVATE', 'Private')]
    privacy = models.CharField(max_length=10, choices=Priv_Choices, default='PUBLIC')
    # For now content is text, but set up options for content 
    content_choices = [('TEXT', 'Text'), ('IMAGE', 'Image')]
    content = models.TextField()
    title = models.CharField(max_length=50)
    
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    comment = models.TextField()
    time = models.DateTimeField(auto_now_add=True)