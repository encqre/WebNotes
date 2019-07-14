from django.contrib import admin
from .models import Profile, Category, Entry, Update
from tinymce.widgets import TinyMCE
from django.db import models

class UpdateAdmin(admin.ModelAdmin):

    formfield_overrides = {
        models.TextField: {'widget': TinyMCE()},
    }

admin.site.register(Profile)
admin.site.register(Category)
admin.site.register(Entry)
admin.site.register(Update, UpdateAdmin)