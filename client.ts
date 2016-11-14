//test
// const readline = require('readline');
// const rl = readline.createInterface({
// 	input: process.stdin,
// 	output: process.stdout
// });
//test
//let WebSocket_ = require('ws');

let nickname = '';
let address = '';
let connection_status = 'disconnected';
let current_chat = '';
let ws = null;
let contacts = {};

nickname = prompt("Username: ", "vasyan");
address = prompt("Server address:", 'localhost');
wsinit(nickname, address);

// rl.question('server address: ', (answer) => {
// 	let address = answer;
// 	rl.question('username: ', (answer) => {
// 		let username = answer;
// 		wsinit(address, username);
// 	});
// });


function wsinit(username, address) {
	ws = new WebSocket('ws://' + address + ':8080/');
	ws.onopen = function (event) {
		ws.send(JSON.stringify({
			op: "connect",
			name: username
		}));
	};
	ws.onerror = function (event) {
		address = prompt("Couldn't reach server. Try another one:", 'localhost');
		wsinit(nickname, address);
	};
	ws.onmessage = function (event) {
		let message = JSON.parse(event.data);
		switch (message.op) {
			case 'connection_status':
				switch (message.status) {
					case 'connected':
						connection_status = 'connected';
					break;
					case 'name_already_taken':
						nickname = prompt("Name already taken. Try another one:", "");
						wsinit(nickname, address);
					break;
					case 'invalid_name':
						nickname = prompt("Invalid name. Try another one:", "");
						wsinit(nickname, address);
					break;
				}
				break;
			case 'message':
				if (connection_status == 'disconnected') {
					break;
				}
				console.log(message.from + ": " + message.msg);
				contacts[message.from].log.push({
					sender: message.from, 
					message: message.msg
				});
				if (message.from != current_chat) {
					let contact = document.getElementById(message.from);
					contact.classList.add('new_message');
					break;
				}

				//func
				let textlog = document.getElementById("text-log");
				appendMessage(message.from, message.msg, textlog);
				textlog.scrollTop = textlog.scrollHeight;
				break;
			case 'update':
			let closeCurrentChatFlag = true;
				let contacts_array = message.contact_list.split(":");
				let new_contacts = {};
				contacts_array.forEach((elem) => {
					if (current_chat == elem) {
						closeCurrentChatFlag = false;
					}
					if (elem != nickname) {
						if (contacts[elem] && contacts[elem].log.length) {
							new_contacts[elem] = {
								log: contacts[elem].log
							}
						} else {
							new_contacts[elem] = {
								log: []
							}
						}
					}
				});	
				contacts = new_contacts;
				let d = document.createElement("div");
				d.id = "contact-list";
				for (let elem in contacts) {
					let oldcontact = document.getElementById(elem);
					let d1 = document.createElement("div");
					let n = document.createTextNode(elem);
					d1.appendChild(n);
					d1.id = elem;
					d1.classList.add('contact');

					if (oldcontact && oldcontact.classList.contains('current_chat')) { d1.classList.add('current_chat'); }
					if (oldcontact && oldcontact.classList.contains('new_message')) {d1.classList.add('new_message'); }

					d1.addEventListener('click', function() {
						changeCurrentChat(d1.id);
					});
					d.appendChild(d1);
//					d1.onclick
				};
				let old = document.getElementById("contact-list");
				old.parentNode.replaceChild(d, old);
				if (closeCurrentChatFlag) {
					closeCurrentChat();
				}
				break;
			default: break;
		}
	};
	return 0;
}

function closeCurrentChat() {
	let ia = document.getElementById('input-area');
	ia.style.display = 'none';
//	let previous_chat = document.getElementsByClassName('current_chat')[0];
//	if (previous_chat) {
//		previous_chat.classList.remove('current_chat');
//	}
	let d = document.createElement("div");
	d.id = "text-log";
	let old = document.getElementById("text-log");
	old.parentNode.replaceChild(d, old);
}

function changeCurrentChat(id) {
	let ia = document.getElementById('input-area');
	ia.style.display = 'initial';

//	let ta = document.getElementById('textarea');
//	ta.style.display = 'initial';

	let previous_chat = document.getElementsByClassName('current_chat')[0];
	if (previous_chat) {
		previous_chat.classList.remove('current_chat');
	}
	let contact = document.getElementById(id);
	contact.classList.add('current_chat');
	contact.classList.remove('new_message');

	current_chat = id;
	let d = document.createElement("div");
	d.id = "text-log";
	contacts[id].log.forEach( (elem) => {
		appendMessage(elem.sender, elem.message, d);
	});
	d.scrollTop = d.scrollHeight;
	let old = document.getElementById("text-log");
	old.parentNode.replaceChild(d, old);
}

function appendMessage(from, msg, textlog) {
	let message_container = document.createElement("div");
	message_container.classList.add('message_container');
	let message_ = document.createElement("div");
	message_.classList.add('message');
	let sender = document.createElement("div");
	sender.classList.add('sender'); 
	let message_text = document.createTextNode(msg);
	let sender_text = document.createTextNode(from + '> '); 
	sender.appendChild(sender_text);
	message_.appendChild(message_text);
	message_container.appendChild(sender);
	message_container.appendChild(message_);
	textlog.appendChild(message_container);
}

function sendmessage(msg, to) {
	if (connection_status != 'connected') {
		return;
	}
	ws.send(JSON.stringify({
		op: "sendmsg",
		from: nickname,
		to: to,
		msg: msg
	}));
	contacts[to].log.push({
		sender: 'Me',
		message: msg
	});
	let textlog = document.getElementById("text-log");
	appendMessage('Me', msg, textlog);
	textlog.scrollTop = textlog.scrollHeight;
//	let d = document.createElement("div");
//	d.id = "text-log";
//	for (let elem in contacts[to].log) {
//		let d1 = document.createElement("div");
//		let n = document.createTextNode(elem);
//		d1.appendChild(n);
//		d1.id = elem;
//		d.appendChild(d1);
//	};
//	let old = document.getElementById("text-log");
//	old.parentNode.replaceChild(d, old);
}



//test


// rl.on('line', (input) => {
// 	let command = input.split(' ');
// 	switch (command[0]) {
// 		case 'send':
// 			ws.send(JSON.stringify({
// 				op: command[0],
// 				from: command[1],
// 				to: command[2],
// 				msg: command[3]
// 			}));
// 			break;
// 	}
// });

document.addEventListener("DOMContentLoaded", function(event) { 
	let ta = document.querySelector('#textarea');
	ta.addEventListener('keydown', function(e) {
		textAreaInputHandler(e, ta);
	});
});

function textAreaInputHandler(e, ta) {
	if ( (e as any).keyCode == '13') {
		e.preventDefault();
		if( (e as any).ctrlKey) {
			ta.value += '\n';
			return;
		} else {
			sendmessage((ta as any).value, current_chat);
			ta.value = "";
		}
	}
}