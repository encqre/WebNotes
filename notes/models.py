from django.db import models
from datetime import datetime
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    userid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    full_name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=200)

    class Meta:
        verbose_name_plural = "Profiles"

    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class Category(models.Model):
    name = models.CharField(max_length=200)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Entry(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    original_title = models.CharField(max_length=500)
    active = models.BooleanField(default=False)
    important = models.BooleanField(default=False)
    create_date = models.DateTimeField("Create date", default=datetime.now())
    last_updated = models.DateTimeField("Last updated", default=datetime.now())
    created_by = models.ForeignKey(Profile, default=1, verbose_name="Created By", on_delete=models.SET_DEFAULT)
    category = models.ForeignKey(Category, default=1, verbose_name="Category", on_delete=models.SET_DEFAULT)

    class Meta:
        verbose_name_plural = "Entries"

    def __str__(self):
        return self.original_title

class Update(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True)
    title = models.CharField(max_length=500)
    content = models.TextField()
    date = models.DateTimeField("Update date", default=datetime.now())
    updater = models.ForeignKey(Profile, default=1, verbose_name="Updated By", on_delete=models.SET_DEFAULT)
    entry = models.ForeignKey(Entry, default=1, verbose_name="Entry", on_delete=models.SET_DEFAULT)

    class Meta:
        verbose_name_plural = "Updates"

    def __str__(self):
        return str(self.title) + " - " + str(self.date) + " - " + str(self.uuid)