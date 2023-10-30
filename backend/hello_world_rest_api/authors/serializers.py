from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from .models import *
from rest_framework.validators import UniqueValidator, ValidationError
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from django.urls import reverse
from .serializers import *

class SignUpSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only = True, required = True, validators = [UniqueValidator(queryset = Author.objects.all())], max_length = 20)
    password = serializers.CharField(write_only = True, required = True, validators = [validate_password])
    password2 = serializers.CharField(write_only = True, required = True)
    displayName = serializers.CharField(required = True, max_length = 50)
    github = serializers.URLField(required = False, allow_blank = True, max_length = 255)
    class Meta:
        model = Author
        fields = ('username', 'password','password2', 'displayName','github')
    def create(self, validated_data):
        user = Author.objects.create_user(
            username = validated_data['username'],
            password = validated_data['password'],
            displayName = validated_data['displayName'],
            github = validated_data['github']
        )
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

class SendFriendRequestSerializer(serializers.Serializer):
    receiver_id = serializers.UUIDField(write_only=True)
        
    def create(self, validated_data):
        sender = self.context.get('request').user
        reciverer_id = validated_data['receiver_id']
        reciver = get_object_or_404(Author, id=reciverer_id)
        existing = Friendship.objects.filter(sender=sender, reciever=reciver)
        if existing.exists():
            raise serializers.ValidationError('Existing relationship or friend request sent')
        return Friendship.objects.create(sender=sender, reciever=reciver, status=1)
        
class RespondFriendRequestSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['accept', 'decline'], write_only=True)
    
    def update(self, friendship, validated_data):
        action = validated_data['action']
        if action == 'accept':
            # Check if reciever is following sender to check for bi-directional relationship
            reverse = Friendship.objects.filter(sender=friendship.reciever, reciever=friendship.sender).first()
            # Check if request has been accepted on other side
            if reverse and reverse.status == 2:
                friendship.status = 3
                friendship.save()
                reverse.status = 3
                reverse.save()
            else:
                friendship.status = 2
                friendship.save()
        if action == 'decline':
            friendship.delete()
        return friendship
    
class DeleteFriendSerializer(serializers.Serializer):
    
    def update(self, friendship, validated_data):
        reverse = Friendship.objects.filter(sender=friendship.reciever, reciever=friendship.sender).first()
        if reverse and reverse.status == 3:
            reverse.status = 2
            reverse.save()
        friendship.delete()
        return friendship
    
class PostCommentSerializer(serializers.ModelSerializer):
    comment = serializers.CharField(write_only=True)
    
    class Meta:
        model = Comment
        fields = ('comment', 'time')
        
    def create(self, validated_data):
        comment = Comment.objects.create(post=self.context['post'],author=self.context['author'], comment=validated_data['comment'])
        comment.save()
        return comment

class AuthorSerializer(serializers.ModelSerializer):
    
    
    url = serializers.URLField(read_only=True)
    displayName = serializers.CharField(allow_null=True)
    github = serializers.URLField(allow_blank = True, allow_null = True)
    class Meta:
        model = Author
        fields = ('type', 'id', 'url', 'displayName', 'profilePicture', 'github')


class LikeingSerializer(serializers.Serializer):
    content_type = serializers.ChoiceField(choices=['post', 'comment'], write_only=True)
    content_id = serializers.IntegerField()
    
    def create(self, validated_data):
        author = self.context['author']
        content_type = ContentType.objects.get(model=validated_data['content_type'])
        if validated_data['content_type'] == 'post':
            content = get_object_or_404(Post, id=validated_data['content_id'])
        elif validated_data['content_type'] == 'comment':
            content = get_object_or_404(Comment, id=validated_data['content_id'])
        return Like.objects.create(liker=author, content_type=content_type, content_object=content)
    
class UnlikingSerializer(serializers.Serializer):
    
    def update(self, like, validated_data):
        like.delete()
        return like
class FriendShipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendship
        fields = ('id','sender', 'reciever', 'status')

class UploadPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ('title', 'content_type', 'privacy', 'text', 'image_url', 'image')

    def create(self, validated_data):
        uploadPost = Post.objects.create(
            author = self.context['author'],
            title = validated_data['title'],
            content_type = validated_data['content_type'],
            privacy = validated_data['privacy'],
            text = validated_data['text'],
            image_url = validated_data['image_url'],
            image = validated_data['image'],
        )
        return uploadPost
    
class EditPostSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=50, required = False, allow_blank = True)
    content_type = serializers.ChoiceField([('TEXT', 'Text'), ('IMAGE', 'Image')], required = False,)
    text = serializers.CharField(max_length=200, required = False, allow_blank = True)
    image_url = serializers.URLField(max_length=200, required = False, allow_blank = True)

    def update(self, instance, validated_data):
        instance.author = self.context['author'],
        instance.title = validated_data['title'],
        instance.content_type = validated_data['content_type'],
        instance.text = validated_data['text']
        instance.image_url = validated_data['image_url']
        instance.save()
        return instance
