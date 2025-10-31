from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django import forms
from .models import User

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email', 'role')  # include your custom fields

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('email', 'role', 'is_active', 'is_staff')

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User

    list_display = ('email', 'role', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active', 'role')
    fieldsets = (
        (None, {'fields': ('email', 'password', 'role')}),
        ('Permissions', {'fields': ('is_staff', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'role', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email',)
    ordering = ('email',)

admin.site.register(User, CustomUserAdmin)
