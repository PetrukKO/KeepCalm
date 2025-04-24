from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth.models import AnonymousUser
from django.views.generic import View

from MainApp.models import User, Chat
from .code import chat_structure_parser as csp

import json



def is_user_authenticated(request):
	user = request.user
	user_validation_properties = [
		request.user != None,
		not request.user.is_anonymous,
		type(request.user) != AnonymousUser,
		len(User.objects.filter(username=user.username)) != 0,
		user.is_active
	]
	return not False in user_validation_properties

def full_name(user):
	if user.last_name != '' and user.first_name != '':
		return user.first_name+' '+user.last_name
	elif user.first_name != '':
		return user.first_name
	elif user.last_name != '':
		return user.last_name
	else:
		return user.username

def base_context(request, **args):
	context = {}
	user = request.user

	context['title'] = 'none'
	context['user'] = 'none'
	context['header'] = 'none'
	context['error'] = 0
	context['message'] = ''
	context['is_superuser'] = False
	context['self_user_has_avatar'] = False
	context['page_name'] = 'default'
	

	if is_user_authenticated(request):

		context['username'] = user.username
		context['full_name'] = full_name(user)
		context['user'] = user

		if request.user.is_superuser:
			context['is_superuser'] = True


	if args != None:
		for arg in args:
			context[arg] = args[arg]

	return context


class StartGamePage(View):
	def get(self, request):
		context = base_context(request, title='Розпочати')
		return render(request, "start_game.html", context)
	

class MainChatPage(View):
	def get(self, request):
		context = base_context(request, title='Чат: Полярний лис')
		return render(request, "chat.html", context)
	

class ChatEditorPage(View):
	def get(self, request, chat_id):
		context = base_context(request, title='Edit')
		context['chat_id'] = chat_id
		context['chat_obj'] = Chat.objects.get(id=chat_id)
		context['title'] = context['chat_obj'].name
		context['chat_structure'] = csp.ChatStructureAdapter.to_json(context['chat_obj'])
		return render(request, "editor.html", context)
	

class AjaxEditorSaveChatStructure(View):
	def post(self, request, chat_id):
		form = request.POST
		chat_structure = form['chat_structure']
		chat_structure = json.loads(chat_structure)
		chat_structure = csp.ChatStructureAdapter.from_json(chat_id, chat_structure)
		
		result = {}
		result["result"] = "success"


		return HttpResponse(
			json.dumps(result),
			content_type="application/json"
		)