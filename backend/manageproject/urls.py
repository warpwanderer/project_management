from django.contrib import admin
from django.urls import path, include
from django.urls import re_path as url
from data_api.views import index, LoginAPIView, RegisterAPIView, TokenRefreshView

urlpatterns = [
    path("", index, name="index"),
    path("admin/", admin.site.urls),
    path("api/", include("data_api.urls")),
    path('login/', LoginAPIView.as_view(), name='login'),
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("token/refresh", TokenRefreshView.as_view(), name="token-refresh"),
]
