from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .serializers import (
    UserRegistrationSerializer, 
    CustomTokenObtainPairSerializer,
    UserSerializer
)
User = get_user_model()
from rest_framework_simplejwt.tokens import RefreshToken

from orders.utils import merge_guest_cart

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            # Check if there is a guest cart to merge
            session_key = request.session.session_key
            if session_key:
                # We need the user object. 
                # Since LoginView doesn't return the user object directly, we fetch it.
                email = request.data.get('email')
                user = User.objects.get(email=email)
                merge_guest_cart(user, session_key)
        return response

class LogoutView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # In a real app, this would be a link to your frontend reset page
            reset_url = f"http://localhost:3000/reset-password/{uid}/{token}/"
            
            send_mail(
                'Password Reset Request',
                f'Click the link to reset your password: {reset_url}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # We return 200 even if user doesn't exist for security (avoid enumeration)
            return Response({"message": "If an account exists with this email, a reset link has been sent."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                new_password = request.data.get('password')
                user.set_password(new_password)
                user.save()
                return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid request."}, status=status.HTTP_400_BAD_REQUEST)
