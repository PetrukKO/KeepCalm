	let selectedNode = null;
	let defaultNodeContent = `
	<textarea class="form-input" df-desc name="description"></textarea>
	`;
	let editor = null;



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
	});

	editor.on('nodeUnselected', function () {
		selectedNode = null;
	});

	editor.on('nodeRemoved', function (id) {
		console.log("Node removed: "+id);
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
	data = {"desc": "" };
	editor.addNode("choice", 1, 1, -1 * coords[0] + 500, -1 * coords[1] + 500, "choiceNode", {}, defaultNodeContent);
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
				console.log("success");
			} else {
			}
		}
	});
}