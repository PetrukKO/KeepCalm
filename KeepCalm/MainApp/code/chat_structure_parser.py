from ..models import Message, Chat, ChatMember, Character, ChatOptionNode, ChatNodeLink
import json


class ChatStructureAdapter:

	@staticmethod
	def update_node(chat, node, nodes_dict):

		if not 'db_id' in node['data']:

			node_obj = ChatOptionNode(chat=chat)
			node_obj.save()
			node['data']['db_id'] = node_obj.id
		
		else:

			node_obj = ChatOptionNode.objects.get(id=node['data']['db_id'])

		node_obj.pos_x = node['pos_x']
		node_obj.pos_y = node['pos_y']
		if 'desc' in node['data']:
			node_obj.description = node['data']['desc']
		node_obj.save()

		if 'root' in node['data'] and node['data']['root'] == 'true':

			chat.root_node = node_obj
			chat.save()

	@staticmethod
	def make_node_connections(chat, node, nodes_dict):

		node_obj = ChatOptionNode.objects.get(id=node['data']['db_id'])

		ChatNodeLink.objects.filter(child=node_obj).delete()

		node_inputs = node['inputs']['input_1']['connections']


		for node_input in node_inputs:
			parent_node = ChatOptionNode.objects.get(id=nodes_dict[str(node_input['node'])]['data']['db_id'])

			if not ChatNodeLink.objects.filter(parent=parent_node, child=node_obj).exists():
				ChatNodeLink(parent=parent_node, child=node_obj).save()

	@staticmethod
	def check_if_any_node_deleted(chat, nodes_dict={}):

		left_nodes = []
		for key in nodes_dict.keys():
			left_nodes.append(nodes_dict[key]['data']['db_id'])

		ChatOptionNode.objects.filter(chat=chat).exclude(id__in=left_nodes).delete()


	@staticmethod
	def from_json(chat_id, json_data):

		chat = Chat.objects.get(id=chat_id)
		tree_root = json_data["Home"]['data']

		for key in tree_root.keys():
			ChatStructureAdapter.update_node(chat, tree_root[key], tree_root)

		for key in tree_root.keys():
			ChatStructureAdapter.make_node_connections(chat, tree_root[key], tree_root)

		ChatStructureAdapter.check_if_any_node_deleted(chat, tree_root)

		pass

	@staticmethod
	def to_json(chat):
		
		json_data = {
			"drawflow": {
				"Home": {
					"data": {

					}
				}
			}
		}


		for node in ChatOptionNode.objects.filter(chat=chat):

			inputs = ChatNodeLink.objects.filter(child=node)
			inputs_template = []
			for i in inputs:
				inputs_template.append({'node': i.parent.id, 'input': 'output_1'})
			

			outputs = ChatNodeLink.objects.filter(parent=node)
			outputs_template = []
			for i in outputs:
				outputs_template.append({'node': i.child.id, 'input': 'output_1'})

			node_template = {
				'id': node.id,
				'name': 'chatNode',
				'data': {
					'desc': node.description,
					'db_id': node.id
				},
				'class': 'chatNode',
				'html': "<textarea class='form-input' df-desc name='description'></textarea>",
				'typenode': False,
				'inputs': {
					'input_1': {
						'connections': inputs_template
					}
				},
				'outputs': {
					'output_1': {
						'connections': []
					}
				},
				'pos_x': node.pos_x,
				'pos_y': node.pos_y
			}

			json_data['drawflow']['Home']['data'][str(node.id)] = node_template



		return json.dumps(json_data)

