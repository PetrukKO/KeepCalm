from django.urls import include, path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import handler404


from .views import (
	StartGamePage,
	MainChatPage,
	ChatEditorPage,
	AjaxEditorSaveChatStructure
)

urlpatterns = [
    path("start_game/", StartGamePage.as_view(), name="start_game"),
	path("editor/<int:chat_id>/", ChatEditorPage.as_view(), name="start_game"),
	path("send_chat_structure/<int:chat_id>/", AjaxEditorSaveChatStructure.as_view(), name="send_chat_structure"),

    path("", MainChatPage.as_view(), name="chat"),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
