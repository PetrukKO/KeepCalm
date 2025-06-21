let selectedNode = null;
let defaultNodeContent = `
	<textarea class="form-input" df-desc="" name="description"></textarea>
	`;
let editor = null;






function sortByTimestamp(arr) {
	arr.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
	return arr;
}







window.addEventListener("load", () => {
	let editorId = document.getElementById("drawflow");

	editor = new Drawflow(editorId);
	editor.editor_mode = 'edit';
	editor.zoom_max = 3.6;
	editor.zoom_min = 0.5;
	editor.zoom_value = 0.1;

	editor.start();

	editor.addModule('nameNewModule');
	var data = { "root": 'true', "desc": "Початок чату" };


	if (chatStructureData == {}) {
		editor.addNode("t78", 0, 1, 200, 500, "chatNode", data, "<h3>Початок чату</h3><input type='hidden' df-name name='root' value='true'><input type='hidden' df-desk value=''>");
	}

	editor.import(chatStructureData);


	editor.on('nodeSelected', function (id) {
		selectedNode = id;
		loadMessagesToEditor(id.replace("node-", ""));
	});

	editor.on('nodeUnselected', function () {
		selectedNode = null;
	});

	editor.on('nodeRemoved', function (id) {
		console.log("Node removed: " + id);
	})
});






document.getElementById("save-btn").addEventListener("click", () => {
	sendChatStructure();
});

document.getElementById("add-node-btn").addEventListener("click", () => {
	addNode();
});

document.getElementById("add-output").addEventListener("click", () => {

	// const selectedId = selectedNode;

	// if (!selectedId) {
	// 	console.warn("No node selected.");
	// 	return;
	// }

	// editor.addNodeOutput(selectedId);
	// editor.updateConnectionNodes(`node-${selectedId}`);
});

document.getElementById("remove-output").addEventListener("click", () => {
	// const selectedId = selectedNode;

	// if (!selectedId) {
	// 	console.warn("No node selected.");
	// 	return;
	// }

	// const node = editor.getNodeFromId(selectedId);
	// const outputCount = Object.keys(node.outputs).length;

	// if (outputCount === 0) {
	// 	console.warn("No nodes to remove.");
	// 	return;
	// }

	// let outputs = Object.keys(node.outputs);

	// const output_class = outputs[outputs.length - 1];

	// editor.removeNodeOutput(selectedId, output_class)
	// editor.updateConnectionNodes(`node-${selectedId}`);
});

document.getElementById("sendNewMessageBtn").addEventListener("click", () => {
	sendNodeMessage();
});

$("#chatNodeId").on('click', '.message-delete-btn', function () {
	deleteNodeMessage(this);
});

function getEditorCenter() {
	let editorTransform = document.querySelector(".drawflow").style.transform;
	const match = editorTransform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);

	if (match) {
		const x = parseFloat(match[1]);
		const y = parseFloat(match[2]);
		return [x, y];
	} else {
		return [0.0, 0.0];
	}
}

function addNode() {
	let coords = [document.querySelector(".drawflow").getBoundingClientRect().x, document.querySelector(".drawflow").getBoundingClientRect().y];
	console.log(coords);
	data = { "desc": "" };
	editor.addNode("choice", 1, 1, -1 * coords[0] + 500, -1 * coords[1] + 500, "choiceNode", {}, defaultNodeContent);
	sendChatStructure();
}


function loadMessagesToEditor(nodeId) {
	removeChildrens(byId("chatNodeId"));
	let messages_list = Object.values(messagesInNodes[parseInt(nodeId)]);
	let messages = sortByTimestamp(messages_list);
	for (let i = 0; i < messages.length; i++) {
		let message = messages[parseInt(i)];
		$("#chatNodeId").append(`
		<div class="message-wrapper incoming">
			<img class="message-avatar" src="{% static 'images/users/code.jpg' %}" alt="avatar">
			<div class="messages-block">
				<div class="message user-2">
					<div class="message-username">`+ message.full_name + `</div>
					<div class="message-content-line" id="message-`+ message.id + `">
						<p class="message-text">`+ message.text + `</p>
						<label class="message-timestamp">`+ message.time_sent + `</label>
						<a class="message-timestamp message-delete-btn" data-value="`+ message.id + `">Del.</a>
					</div>
				</div>
			</div>
		</div>
			`
		);
	}
}


function sendChatStructure() {

	let chat_structure_send = JSON.stringify(editor.export()["drawflow"]);

	$.ajax({
		url: "/send_chat_structure/" + chatId + "/",
		type: 'POST',
		data: {
			'chat_structure': chat_structure_send
		},
		beforeSend: function (xhr) {
			attachCSRFToken(xhr);
		},
		success: function a(json) {
			if (json.result === "success") {
				editor.import(JSON.parse(JSON.parse(json.updatedStructure)));
				messagesInNodes = JSON.parse(json.messagesInNodes);
				warnUser("Saved!", "");
				
			} else {
			}
		}
	});
}


function sendNodeMessage() {

	let messageId = 0;
	let nodeId = selectedNode.replace("node-", "");
	let messageText = byId("messageText").value;
	let senderCharacter = byId("senderCharacter").value;
	let dateWasWritten = byId("dateWasWritten").value;
	let timeWasWritten = byId("timeWasWritten").value;
	let timeSWasWritten = byId("timeSWasWritten").value;
	let timeMsWasWritten = byId("timeMsWasWritten").value;


	$.ajax({
		url: "/send_node_message/",
		type: 'POST',
		data: {
			'messageId': messageId,
			'nodeId': nodeId,
			'messageText': messageText,
			'senderCharacter': senderCharacter,
			'dateWasWritten': dateWasWritten,
			'timeWasWritten': timeWasWritten,
			'timeSWasWritten': timeSWasWritten,
			'timeMsWasWritten': timeMsWasWritten
		},
		beforeSend: function (xhr) {
			attachCSRFToken(xhr);
		},
		success: function a(json) {
			if (json.result === "success") {
				let newMessageId = json.messageId;
				messagesInNodes[parseInt(nodeId)][parseInt(newMessageId)] = {
					"id": newMessageId,
					"text": messageText,
					"time_was_written": timeWasWritten,
					"time_sent": timeWasWritten + ":" + timeSWasWritten + ":" + timeMsWasWritten,
					"timestamp": dateWasWritten + " " + timeWasWritten + ":" + timeSWasWritten + "." + timeMsWasWritten + "+00:00",
					"was_read": false,
					"attached_image": "",
					"username": senderCharacter,
					"full_name": charactersInfo[senderCharacter]
				};
				console.log("success");
				loadMessagesToEditor(nodeId);
			} else {
			}
		}
	});
}

function deleteNodeMessage(target) {
	console.log(target);

	let messageId = target.getAttribute("data-value");

	$.ajax({
		url: "/delete_node_message/",
		type: 'POST',
		data: {
			'messageId': messageId,
		},
		beforeSend: function (xhr) {
			attachCSRFToken(xhr);
		},
		success: function a(json) {
			if (json.result === "success") {
				let deletedMessageId = json.deletedMessageId;


				const messagesBlock = target.closest('.message-wrapper');
				
				target.parentNode.remove();

				if (!messagesBlock) return; // если нет — выходим				

				const remaining = messagesBlock.querySelectorAll('.message-content-line');
				if (remaining.length === 0) {
					messagesBlock.remove();
				}

				nodeId = selectedNode.replace("node-", "");
				delete messagesInNodes[parseInt(nodeId)][parseInt(deletedMessageId)];
				console.log("success");
				loadMessagesToEditor(nodeId);
			} else {
			}
		}
	});
}






function warnUser(title, desc) {
    const container = document.getElementById('warn-container');

    const toast = document.createElement('div');
    toast.className = 'warn-toast';

    const titleEl = document.createElement('div');
    titleEl.className = 'warn-title';
    titleEl.textContent = title;

    const descEl = document.createElement('div');
    descEl.textContent = desc;

    toast.appendChild(titleEl);
    toast.appendChild(descEl);
    container.appendChild(toast);

    // Remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => container.removeChild(toast), 500); // wait for fadeout
    }, 4000);
}
