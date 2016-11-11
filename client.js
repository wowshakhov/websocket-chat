//test
const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
//test

let WebSocket = require('ws');
let nickname = 'Vasya';
let status = 'disconnected';
let ws = null;
let contacts = [];

rl.question('server address: ', (answer) => {
	let address = answer;
	rl.question('username: ', (answer) => {
		let username = answer;
		wsinit(address, username);
	});
});

function wsinit(address, username) {
	ws = new WebSocket('ws://' + address + ':8080/');
	ws.on('open', function open() {
		ws.send(JSON.stringify({
			op: "connect",
			name: username
		}));
	});

	ws.on('message', function(data, flags) {
		let message = JSON.parse(data);
		switch (message.op) {
			case 'connection_status':
				if (message.status == 'connected') {
					status = 'connected';
				}
				break;
			case 'message':
				console.log(message.from + ": " + message.msg);
				break;
			case 'update':
				contacts = message.contact_list.split(":");
				console.log(contacts.toString());
			default: break;
		}
	});
}

function sendmessage(msg, to) {
	if (status != 'connected') {
		return;
	}
	ws.send(JSON.stringify({
		op: "sendmsg",
		to: to,
		msg: msg
	}));
}

//test

rl.on('line', (input) => {
	let command = input.split(' ');
	switch (command[0]) {
		case 'send':
			ws.send(JSON.stringify({
				op: command[0],
				from: command[1],
				to: command[2],
				msg: command[3]
			}));
			break;
	}
});