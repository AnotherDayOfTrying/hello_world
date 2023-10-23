from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Author

class SignUpSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required = True)
    password = serializers.CharField(write_only = True, required = True, validators = [validate_password])
    password2 = serializers.CharField(write_only = True, required = True)
    displayName = serializers.CharField(required = False, allow_blank = True, max_length = 50)
    github = serializers.URLField(required = False, allow_blank = True, max_length = 255)
    class Meta:
        model = Author
        fields = ('username', 'password','password2', 'displayName','github')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return super().validate(attrs)
    def create(self, validated_data):
        user = Author.objects.create_user(
            username = validated_data['username'],
            password = validated_data['password'],
            displayName = validated_data['displayName'],
            github = validated_data['github']
        )
        return user