from django.urls import path
from . import views

app_name = "notes" 

urlpatterns = [
    path('', views.my_login, name='my_login'),
    path('logout/', views.my_logout, name='my_logout'),
    path('auth/', views.auth, name="auth"),
    path('notes/', views.notes, name='notes'),
    path('notes/history', views.history, name='history'),
    path('notes/my_updates/', views.my_updates, name='my_updates'),
    path('notes/remove/', views.remove, name='remove'),
    path('notes/edit/', views.edit, name='edit'),
    path('notes/new/', views.new, name='new'),
    path('notes/get_content/', views.get_content, name='get_content'),
] 

