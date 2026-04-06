from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin or superadmin users by checking their role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'superadmin']
        )
