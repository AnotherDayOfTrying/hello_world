from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from .models import *
from rest_framework.validators import UniqueValidator, ValidationError
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from django.urls import reverse
from .serializers import *
from rest_framework.authtoken.models import Token

class SignUpSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only = True, required = True, validators = [UniqueValidator(queryset = Author.objects.all())], max_length = 30)
    password = serializers.CharField(write_only = True, required = True, validators = [validate_password])
    password2 = serializers.CharField(write_only = True, required = True)
    displayName = serializers.CharField(required = True, max_length = 50)
    github = serializers.URLField(required = False, allow_blank = True, max_length = 255)
    
    class Meta:
        model = Author
        fields = ('uid', 'username', 'password','password2', 'displayName', 'github', 'profilePictureImage')
    def create(self, validated_data):
        
        user_data = {
            "username": validated_data['username'],
            "password": validated_data['password'],
            "displayName": validated_data['displayName'],
            "github": validated_data['github'],
        }
        if validated_data.get('profilePictureImage') is not None:
            user_data = {**user_data, "profilePictureImage": validated_data['profilePictureImage']}
        user = Author.objects.create_user(**user_data)
        return user
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        username_exist = Author.objects.filter(username = attrs['username']).exists()
        if username_exist:
            raise serializers.ValidationError({"username": "Username is already taken."})
        return super().validate(attrs)
    
class SignInSerializer(serializers.Serializer):
    username = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)
    
    def validate(self, data):
        username = data['username']
        password = data['password']
        author = authenticate(request=self.context.get('request'), username=username, password=password)
        if not author:
            raise serializers.ValidationError('Invalid Credentials')
        if not author.is_approved:
            raise serializers.ValidationError('Author is not approved')
        data['author'] = author
        return data
class AuthorSerializer(serializers.ModelSerializer):
    
    displayName = serializers.CharField(allow_null=True)
    github = serializers.URLField(allow_blank = True, allow_null = True)
    profilePicture = serializers.SerializerMethodField()
    profilePictureImage = serializers.ImageField(write_only=True, required=False)
    class Meta:
        model = Author
        fields = ('type', 'id', 'url', 'displayName', 'profileImage','profilePictureImage', 'github','host')
        
    def update(self, instance, validated_data):
        instance.displayName = validated_data.get('displayName', instance.displayName)
        instance.github = validated_data.get('github', instance.github)
        if validated_data.get('profilePictureImage') is not None:
            instance.profilePictureImage = validated_data.get('profilePictureImage', instance.profilePictureImage)
        instance.save()
        return instance
    def get_profileImage(self, obj):
        if obj.profilePicture is None:
            request = self.context.get('request')
            profilePicture_url = obj.profilePictureImage.url
            return request.build_absolute_uri(profilePicture_url)
        else:
            return obj.profilePicture
class FriendShipSerializer(serializers.ModelSerializer):
    actor = AuthorSerializer()
    object = AuthorSerializer()
    class Meta:
        model = Friendship
        fields = ('type','summary','actor', 'object')
    def create(self, validated_data):
        
        actor_data = validated_data.pop('actor')
        object_data = validated_data.pop('object')
        actor = Author.objects.get(uid=actor_data['id'].split("/")[-1])
        object = Author.objects.get(uid=object_data['id'].split("/")[-1])
        friendship = Friendship.objects.create(summary = validated_data['summary'],actor=actor, object=object, status=1)
        return friendship    
class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer()
    class Meta:
        model = Post
        fields = ('type','title','id','source','origin','description','contentType','content','author','categories','count','comments','published','visibility','unlisted','author')
        
    def create(self, validated_data):
        actor_data = validated_data.pop('author')
        
        # if the post is creates a new post but generates a new id
        if validated_data.get('source') is None and validated_data.get('origin') is None and validated_data.get('id') is None:
            post = Post.objects.create(
                author = Author.objects.get(uid=actor_data['id'].split("/")[-1]),
                title = validated_data['title'],
                description = validated_data['description'],
                contentType = validated_data['contentType'],
                content = validated_data['content'],
                categories = validated_data['categories'],
                visibility = validated_data['visibility'],
                unlisted = validated_data['unlisted'],
                
            )
        # if the post is a new post but id is specified
        elif validated_data.get('source') is None and validated_data.get('origin') is None:  
            post = Post.objects.create(
                uid = validated_data['id'].split("/")[-1],
                author = Author.objects.get(uid=actor_data['id'].split("/")[-1]),
                title = validated_data['title'],
                id = validated_data['id'],
                description = validated_data['description'],
                contentType = validated_data['contentType'],
                content = validated_data['content'],
                categories = validated_data['categories'],
                visibility = validated_data['visibility'],
                unlisted = validated_data['unlisted'], 
            )
        else:
             post = Post.objects.create(
                uid = validated_data['id'].split("/")[-1],
                author = Author.objects.get(uid=actor_data['id'].split("/")[-1]),
                title = validated_data['title'],
                id = validated_data['id'],
                description = validated_data['description'],
                contentType = validated_data['contentType'],
                content = validated_data['content'],
                categories = validated_data['categories'],
                visibility = validated_data['visibility'],
                unlisted = validated_data['unlisted'],
                source = validated_data['source'],
                origin = validated_data['origin'],
             )
            
        return post
    def update(self, instance, validated_data):
        if validated_data.get('title') is not None:
            instance.title = validated_data.get('title', instance.title)
        if validated_data.get('description') is not None:
            instance.description = validated_data.get('description', instance.description)
        if validated_data.get('contentType') is not None:
            instance.contentType = validated_data.get('contentType', instance.contentType)
        if validated_data.get('content') is not None:
            instance.content = validated_data.get('content', instance.content)
        if validated_data.get('categories') is not None:
            instance.categories = validated_data.get('categories', instance.categories)
        if validated_data.get('visibility') is not None:
            instance.visibility = validated_data.get('visibility', instance.visibility)
        if validated_data.get('unlisted') is not None:
            instance.unlisted = validated_data.get('unlisted', instance.unlisted)
        if validated_data.get('source') is not None:
            instance.source = validated_data.get('source', instance.source)
        instance.save()
        return instance
class InboxSerializer(serializers.ModelSerializer):

    contentObject = serializers.SerializerMethodField()
    class Meta:
        model = Inbox_Item
        fields = '__all__'
    def get_contentObject(self, object):
        model = object.content_type.model_class()
        
        # Get the related object
        related_obj = model.objects.get(uid=object.object_id)
        request = self.context.get('request')
        # Use the appropriate serializer based on the model class
        if isinstance(related_obj, Friendship):
            return FriendShipSerializer(related_obj, context={'request': request}).data
        elif isinstance(related_obj, Post):
            return PostSerializer(related_obj,context = {'request':request}).data
        elif isinstance(related_obj, Comment):
            return CommentSerializer(related_obj, context={'post': related_obj.post, 'author': related_obj.author,'request': request}).data
        elif isinstance(related_obj, Like):
            return LikeSerializer(related_obj, context={'author': related_obj.author,'request': request}).data
        else:
            raise Exception('Unexpected model class')
        
class CommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer()
    class Meta:
        model = Comment
        fields = ('author', 'id', 'comment', 'contentType', 'published', 'type')

    def create(self, validated_data):
        comment = Comment.objects.create(
            post = self.context['post'],
            author = self.context['author'],
            comment = validated_data['comment'],
            contentType = validated_data['contentType'],
        )
        comment.save()
        return comment
class PostImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    image = serializers.ImageField(write_only=True, required=False)
    class Meta:
        model = PostImage
        fields = ('image','image_url')
    def create(self, validated_data):
        request = self.context.get('request')
        image = PostImage.objects.create(
            post = self.context['post'],
            image = request.data['image'],
        )
        image.save()
        return image
    def update(self, instance, validated_data):
        request = self.context.get('request')
        instance.image = request.data['image']
        instance.save()
        return instance

    def get_image_url(self, obj):
        if obj.image_url is None:
            request = self.context.get('request')
            post_image_url = obj.image.url
            return request.build_absolute_uri(post_image_url)
        else:
            return obj.image_url
    

class LikeSerializer(serializers.ModelSerializer):
    author = AuthorSerializer()
    class Meta:
        model = Like
        fields = ('author', 'object', 'summary', 'type')
    
    def create(self, validated_data):
        url = validated_data['object']
        obj_id = url.split('/')[-1]
        obj_type = url.split('/')[-2]
        
        if obj_type == 'posts':
            content = get_object_or_404(Post, uid=obj_id)
        elif obj_type == 'comments':
            content = get_object_or_404(Comment, uid=obj_id)
        like = Like.objects.create(
            author = self.context['author'],
            content_object=content,
            )
        like.save()
        return like