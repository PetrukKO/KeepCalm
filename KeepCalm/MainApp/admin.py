from django.contrib import admin
from .models import (
    Chat, ChatOptionNode, ChatNodeLink,
    Character, Message, ChatMember
)


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_group', 'root_node')
    search_fields = ('name',)
    list_filter = ('is_group',)


@admin.register(ChatOptionNode)
class ChatOptionNodeAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'description', 'pos_x', 'pos_y')
    list_filter = ('chat',)
    search_fields = ('description',)


@admin.register(ChatNodeLink)
class ChatNodeLinkAdmin(admin.ModelAdmin):
    list_display = ('id', 'parent', 'child')
    list_filter = ('parent__chat',)
    search_fields = ('parent__description', 'child__description')


@admin.register(Character)
class CharacterAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'full_name', 'short_name', 'display_color', 'typing_speed')
    search_fields = ('username', 'full_name', 'short_name')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'node', 'user', 'timestamp', 'was_read')
    list_filter = ('was_read', 'timestamp', 'user')
    search_fields = ('text',)


@admin.register(ChatMember)
class ChatMemberAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'character')
    list_filter = ('chat',)
    search_fields = ('character__full_name', 'character__username')
