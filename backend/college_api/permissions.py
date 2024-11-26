from rest_framework import permissions

class IsOwnerOrFaculty(permissions.BasePermission):
    """
    Custom permission to only allow owners of a student profile or faculty members to edit it.
    """
    def has_permission(self, request, view):
        # Allow faculty members to view all students
        if hasattr(request.user, 'faculty'):
            return True
        # Allow students to access their own profile
        if hasattr(request.user, 'student'):
            return True
        return False

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to faculty members
        if request.method in permissions.SAFE_METHODS and hasattr(request.user, 'faculty'):
            return True

        # Write permissions are only allowed to the owner of the profile
        return obj.user == request.user
