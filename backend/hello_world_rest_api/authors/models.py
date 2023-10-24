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
    

    USERNAME_FIELD = 'username'
    def __str__(self):
        return self.username
    @property
    def url(self):
        return self.host + "authors/" + str(self.id)
    objects = UserManager()
