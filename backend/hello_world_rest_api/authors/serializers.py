from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from .models import Author
from rest_framework.validators import UniqueValidator

class SignUpSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only = True, required = True, validators = [UniqueValidator(queryset = Author.objects.all())], max_length = 20)
    password = serializers.CharField(write_only = True, required = True, validators = [validate_password])
    password2 = serializers.CharField(write_only = True, required = True)
    displayName = serializers.CharField(required = False, allow_blank = True, max_length = 50)
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
        data['author'] = author
        return data

    
    