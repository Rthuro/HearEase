from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django import forms
from .models import User

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email', 'is_user', 'is_admin', 'is_superadmin')  # include your custom fields

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('email', 'is_active', 'is_staff','is_user', 'is_admin', 'is_superadmin')

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User

    list_display = ('email', 'is_staff', 'is_active', 'is_user', 'is_admin', 'is_superadmin')
    list_filter = ('is_staff', 'is_active')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_user', 'is_admin', 'is_superadmin')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'is_staff', 'is_active', 'is_user', 'is_admin', 'is_superadmin')}
        ),
    )
    search_fields = ('email',)
    ordering = ('email',)

admin.site.register(User, CustomUserAdmin)
