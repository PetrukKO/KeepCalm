


function getCookie(name) {
	var cookieValue = null;
	if (document.cookie && document.cookie != '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = jQuery.trim(cookies[i]);
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) == (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}


function attachCSRFToken(xhr) {
	xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
}

function getCSRFToken() {
    return document.querySelector('input[name="csrfmiddlewaretoken"]').value;
}

function exists(querySelectorRule) {
	var element = document.querySelector(querySelectorRule);
	return element != null;
}

function byId(id) {
	return document.getElementById(id);
}

function sendDefaultData() {

	let some_data = { "data": "some data" };

	$.ajax({
		url: "/send_data/",
		type: 'POST',
		data: {
			'data_content': chat_structure_send
		},
		beforeSend: function (xhr, settings) {
			collectCookies(xhr);
		},
		success: function a(json) {
			if (json.result === "success") {

			} else {

			}
		}
	});
}