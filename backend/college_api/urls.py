from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import FacultyViewSet, StudentViewSet, CustomTokenObtainPairView

router = DefaultRouter()
router.register(r'faculty', FacultyViewSet)
router.register(r'students', StudentViewSet, basename='student')

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
