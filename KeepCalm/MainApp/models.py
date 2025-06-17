import datetime
from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import make_aware


class Chat(models.Model):
	name = models.CharField(max_length=150)
	is_group = models.BooleanField(default=False)
	root_node = models.ForeignKey('ChatOptionNode', null=True, on_delete=models.SET_NULL, related_name='entry_for')


class ChatOptionNode(models.Model):
	chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
	description = models.CharField(max_length=250, blank=True, default="")

	pos_x = models.IntegerField(default=0)
	pos_y = models.IntegerField(default=0)


class ChatNodeLink(models.Model):
	parent = models.ForeignKey(ChatOptionNode, on_delete=models.CASCADE, related_name="child_links")
	child = models.ForeignKey(ChatOptionNode, on_delete=models.CASCADE, related_name="parent_links")

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['parent', 'child'], name='unique_node_connection')
		]
	

class Character(models.Model):
	username = models.CharField(max_length=150)
	full_name = models.CharField(max_length=150)
	short_name = models.CharField(max_length=150)

	display_color = models.CharField(max_length=7, default="#000000")
	typing_speed = models.FloatField(default=1.0)
	avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)


class Message(models.Model):
	node = models.ForeignKey(ChatOptionNode, on_delete=models.CASCADE)
	user = models.ForeignKey(Character, on_delete=models.CASCADE)
	timestamp = models.DateTimeField(default=make_aware(datetime.datetime(2021, 12, 10)))
	attached_image = models.ImageField(upload_to='chat_images/', null=True, blank=True)
	was_read = models.BooleanField(default=False)
	time_was_written = models.IntegerField(default=-1)
	text = models.CharField(max_length=1000)



class ChatMember(models.Model):
	chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
	character = models.ForeignKey(Character, on_delete=models.CASCADE)

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['character', 'chat'], name='unique_chat_member')
		]

