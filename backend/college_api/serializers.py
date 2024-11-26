from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.files.images import get_image_dimensions
from .models import Faculty, Student
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import logging
import json

logger = logging.getLogger(__name__)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims with detailed logging
        logger.info(f'Generating token for user: {user.username}')
        logger.info(f'User has faculty attr: {hasattr(user, "faculty")}')
        logger.info(f'User has student attr: {hasattr(user, "student")}')

        if hasattr(user, 'faculty'):
            token['user_type'] = 'faculty'
            token['faculty_id'] = user.faculty.id
            logger.info(f'User {user.username} identified as faculty with ID: {user.faculty.id}')
        elif hasattr(user, 'student'):
            token['user_type'] = 'student'
            token['student_id'] = user.student.id
            logger.info(f'User {user.username} identified as student with ID: {user.student.id}')
        else:
            token['user_type'] = 'unknown'
            logger.warning(f'User {user.username} has no role assigned')

        return token

class UserSerializer(serializers.ModelSerializer):
    def to_internal_value(self, data):
        if isinstance(data, dict):
            return super().to_internal_value(data)
        if isinstance(data, str):
            try:
                return super().to_internal_value(json.loads(data))
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid JSON format for user data")
        raise serializers.ValidationError("User data must be either a JSON string or dictionary")

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'first_name', 'last_name', 'email')
        extra_kwargs = {'password': {'write_only': True}}

class FacultySerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Remove read_only=True to allow creation

    def create(self, validated_data):
        logger.info(f"Creating faculty with data: {validated_data}")
        user_data = validated_data.pop('user')

        try:
            # Create the user first
            user_serializer = UserSerializer(data=user_data)
            user_serializer.is_valid(raise_exception=True)
            user = User.objects.create_user(
                username=user_data['username'],
                password=user_data['password'],
                email=user_data.get('email', ''),
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', '')
            )
            logger.info(f"Created user: {user.username}")

            # Create faculty profile with remaining data
            faculty = Faculty.objects.create(user=user, **validated_data)
            logger.info(f"Created faculty profile for user: {user.username}")
            return faculty

        except Exception as e:
            logger.error(f"Error creating faculty: {str(e)}")
            if 'user' in locals():
                user.delete()
            raise serializers.ValidationError(str(e))

    class Meta:
        model = Faculty
        fields = ('id', 'user', 'subject', 'contact_number', 'address')

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Remove read_only=True to allow creation
    faculties = FacultySerializer(many=True, read_only=True)
    profile_pic_url = serializers.SerializerMethodField()

    def get_profile_pic_url(self, obj):
        if obj.profile_pic:
            return self.context['request'].build_absolute_uri(obj.profile_pic.url)
        return None

    def validate_profile_pic(self, value):
        if value:
            # Check file size
            if value.size > 5 * 1024 * 1024:  # 5MB
                raise serializers.ValidationError("Image file too large ( > 5MB )")

            # Check image dimensions
            width, height = get_image_dimensions(value)
            if width > 4096 or height > 4096:
                raise serializers.ValidationError("Image dimensions too large")

            # Check file extension
            ext = value.name.split('.')[-1].lower()
            if ext not in ['jpg', 'jpeg', 'png', 'gif']:
                raise serializers.ValidationError("Unsupported file extension")

        return value

    def create(self, validated_data):
        logger.info("=== Starting Student Creation Process ===")
        logger.info(f"Initial data type: {type(self.initial_data)}")
        logger.info(f"Initial data content: {json.dumps(self.initial_data, indent=2)}")
        logger.info(f"Validated data content: {json.dumps(validated_data, default=str, indent=2)}")

        # Extract user data and create user first
        try:
            user_data = validated_data.pop('user')
            logger.info(f"Extracted user data: {json.dumps(user_data, indent=2)}")

            # Create the user first
            user_serializer = UserSerializer(data=user_data)
            if not user_serializer.is_valid():
                logger.error(f"User validation errors: {user_serializer.errors}")
                raise serializers.ValidationError(user_serializer.errors)
            logger.info("User data validated successfully")

            user = User.objects.create_user(
                username=user_data['username'],
                password=user_data['password'],
                email=user_data.get('email', ''),
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', '')
            )
            logger.info(f"Created user successfully: {user.username}")

            # Create student profile with remaining data
            logger.info(f"Creating student profile with data: {json.dumps(validated_data, default=str, indent=2)}")
            student = Student.objects.create(user=user, **validated_data)
            logger.info(f"Successfully created student profile for user: {user.username}")
            return student

        except Exception as e:
            logger.error("=== Student Creation Failed ===")
            logger.error(f"Error type: {type(e).__name__}")
            logger.error(f"Error message: {str(e)}")
            if 'user' in locals():
                logger.info(f"Rolling back: Deleting created user {user.username}")
                user.delete()
            raise serializers.ValidationError(str(e))

    class Meta:
        model = Student
        fields = ('id', 'user', 'profile_pic', 'profile_pic_url', 'date_of_birth',
                 'gender', 'blood_group', 'contact_number', 'address', 'faculties')
        extra_kwargs = {
            'profile_pic': {'write_only': True}
        }
