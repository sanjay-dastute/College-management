import json
import logging
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.conf import settings
from .models import Faculty, Student
from .serializers import UserSerializer, FacultySerializer, StudentSerializer, CustomTokenObtainPairSerializer
from .permissions import IsOwnerOrFaculty

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        faculty = self.get_object()
        students_data = [{
            'name': f"{s.user.first_name} {s.user.last_name}",
            'email': s.user.email,
            'contact': s.contact_number,
            'blood_group': s.blood_group
        } for s in Student.objects.filter(faculties=faculty)]

        return Response({
            'faculty_info': {
                'name': f"{faculty.user.first_name} {faculty.user.last_name}",
                'subject': faculty.subject,
                'email': faculty.user.email,
                'contact': faculty.contact_number
            },
            'assigned_students': students_data
        })

    @action(detail=True, methods=['post'])
    def add_student(self, request, pk=None):
        logger = logging.getLogger('college_api.views')
        faculty = self.get_object()
        student_id = request.data.get('student_id')
        try:
            student = Student.objects.get(id=student_id)
            student.faculties.add(faculty)
            logger.info(f"Faculty {faculty.user.username} added student {student.user.username}")
            return Response({
                'status': 'success',
                'message': f'Student {student.user.username} added to {faculty.subject} class'
            })
        except Student.DoesNotExist:
            logger.error(f"Student with id {student_id} not found")
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]  # Removed IsOwnerOrFaculty here
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'faculty'):
            return Student.objects.all()  # Faculty can see all students
        elif hasattr(user, 'student'):
            return Student.objects.filter(user=user)  # Students can only see themselves
        return Student.objects.none()

    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        student = self.get_object()
        faculty_data = [{
            'name': f"{f.user.first_name} {f.user.last_name}",
            'subject': f.subject,
            'contact': f.contact_number,
            'email': f.user.email
        } for f in student.faculties.all()]

        return Response({
            'student_info': {
                'name': f"{student.user.first_name} {student.user.last_name}",
                'email': student.user.email,
                'contact': student.contact_number
            },
            'enrolled_courses': faculty_data
        })

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser], permission_classes=[permissions.IsAuthenticated])
    def upload_profile_pic(self, request, pk=None):
        student = self.get_object()
        if not (hasattr(request.user, 'faculty') or (hasattr(request.user, 'student') and request.user.student == student)):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        if 'profile_pic' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES['profile_pic']

        # Validate file type
        if file.content_type not in settings.ALLOWED_PROFILE_PIC_TYPES:
            return Response({
                'error': f'Invalid file type. Allowed types: {", ".join(settings.ALLOWED_PROFILE_PIC_TYPES)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size
        if file.size > settings.MAX_UPLOAD_SIZE:
            return Response({
                'error': f'File too large. Maximum size is {settings.MAX_UPLOAD_SIZE/1024/1024}MB.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Delete old profile picture if it exists
            if student.profile_pic:
                student.profile_pic.delete(save=False)

            student.profile_pic = file
            student.save()

            return Response({
                'status': 'success',
                'message': 'Profile picture updated successfully',
                'profile_pic_url': request.build_absolute_uri(student.profile_pic.url)
            })
        except Exception as e:
            logging.error(f"Error uploading profile picture: {str(e)}")
            return Response({
                'error': 'Failed to upload profile picture'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        logger = logging.getLogger('college_api.views')
        logger.debug(f"Received request data: {self.request.data}")
        logger.debug(f"Request content type: {self.request.content_type}")
        logger.debug(f"Request FILES: {self.request.FILES}")
        try:
            serializer.save()
            logger.debug(f"Successfully created student profile")
        except Exception as e:
            logger.error(f"Error creating student: {str(e)}")
            logger.error(f"Error details: {e.__class__.__name__}: {str(e)}")
            raise serializers.ValidationError(str(e))

    def perform_update(self, serializer):
        try:
            # Handle user data updates if provided
            user_data = self.request.data.get('user', {})
            if user_data:
                user = serializer.instance.user
                for field in ['first_name', 'last_name', 'email']:
                    if field in user_data:
                        setattr(user, field, user_data[field])
                user.save()

            # Save the student instance with any file uploads
            serializer.save()
        except Exception as e:
            raise serializers.ValidationError(str(e))

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Delete old profile picture if it exists
        if instance.profile_pic:
            instance.profile_pic.delete(save=False)
        return super().destroy(request, *args, **kwargs)
