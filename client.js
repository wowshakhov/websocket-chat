/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	//test
	// const readline = require('readline');
	// const rl = readline.createInterface({
	// 	input: process.stdin,
	// 	output: process.stdout
	// });
	//test
	//let WebSocket_ = require('ws');
	var nickname = '';
	var connection_status = 'disconnected';
	var current_chat = '';
	var ws = null;
	var contacts = {};
	while (!(nickname = prompt("Username: ", "vasyan"))) {
	    nickname = prompt("Please enter a valid username below:", "");
	}
	var address = prompt("Server address:", 'localhost');
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
	        alert("Disconnected.");
	    };
	    ws.onmessage = function (event) {
	        var message = JSON.parse(event.data);
	        switch (message.op) {
	            case 'connection_status':
	                if (message.status == 'connected') {
	                    connection_status = 'connected';
	                }
	                //test
	                break;
	            case 'message':
	                console.log(message.from + ": " + message.msg);
	                contacts[message.from].log.push(message.from + ": " + message.msg);
	                if (message.from != current_chat) {
	                    var contact = document.getElementById(message.from);
	                    contact.classList.add('new_message');
	                    break;
	                }
	                var textlog = document.getElementById("text-log");
	                var msgdiv = document.createElement("div");
	                var text = document.createTextNode(message.from + ': ' + message.msg);
	                msgdiv.appendChild(text);
	                textlog.appendChild(msgdiv);
	                textlog.scrollTop = textlog.scrollHeight;
	                break;
	            case 'update':
	                var closeCurrentChatFlag_1 = true;
	                var contacts_array = message.contact_list.split(":");
	                var new_contacts_1 = {};
	                contacts_array.forEach(function (elem) {
	                    if (current_chat == elem) {
	                        closeCurrentChatFlag_1 = false;
	                    }
	                    if (elem != nickname) {
	                        if (contacts[elem] && contacts[elem].log.length) {
	                            new_contacts_1[elem] = {
	                                log: contacts[elem].log
	                            };
	                        }
	                        else {
	                            new_contacts_1[elem] = {
	                                log: []
	                            };
	                        }
	                    }
	                });
	                contacts = new_contacts_1;
	                var d = document.createElement("div");
	                d.id = "contact-list";
	                var _loop_1 = function(elem) {
	                    var oldcontact = document.getElementById(elem);
	                    var d1 = document.createElement("div");
	                    var n = document.createTextNode(elem);
	                    d1.appendChild(n);
	                    d1.id = elem;
	                    if (oldcontact && oldcontact.classList.contains('current_chat')) {
	                        d1.classList.add('current_chat');
	                    }
	                    if (oldcontact && oldcontact.classList.contains('new_message')) {
	                        d1.classList.add('new_message');
	                    }
	                    d1.addEventListener('click', function () {
	                        changeCurrentChat(d1.id);
	                    });
	                    d.appendChild(d1);
	                };
	                for (var elem in contacts) {
	                    _loop_1(elem);
	                }
	                ;
	                var old = document.getElementById("contact-list");
	                old.parentNode.replaceChild(d, old);
	                if (closeCurrentChatFlag_1) {
	                    closeCurrentChat();
	                }
	                break;
	            default: break;
	        }
	    };
	    return 0;
	}
	function closeCurrentChat() {
	    var ia = document.getElementById('input-area');
	    ia.style.display = 'none';
	    //	let previous_chat = document.getElementsByClassName('current_chat')[0];
	    //	if (previous_chat) {
	    //		previous_chat.classList.remove('current_chat');
	    //	}
	    var d = document.createElement("div");
	    d.id = "text-log";
	    var old = document.getElementById("text-log");
	    old.parentNode.replaceChild(d, old);
	}
	function changeCurrentChat(id) {
	    var ia = document.getElementById('input-area');
	    ia.style.display = 'initial';
	    //	let ta = document.getElementById('textarea');
	    //	ta.style.display = 'initial';
	    var previous_chat = document.getElementsByClassName('current_chat')[0];
	    if (previous_chat) {
	        previous_chat.classList.remove('current_chat');
	    }
	    var contact = document.getElementById(id);
	    contact.classList.add('current_chat');
	    contact.classList.remove('new_message');
	    current_chat = id;
	    var d = document.createElement("div");
	    d.id = "text-log";
	    contacts[id].log.forEach(function (elem) {
	        var d1 = document.createElement("div");
	        var n = document.createTextNode(elem);
	        d1.appendChild(n);
	        d.appendChild(d1);
	    });
	    d.scrollTop = d.scrollHeight;
	    var old = document.getElementById("text-log");
	    old.parentNode.replaceChild(d, old);
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
	    contacts[to].log.push('Me: ' + msg);
	    var textlog = document.getElementById("text-log");
	    var message = document.createElement("div");
	    var text = document.createTextNode('Me: ' + msg);
	    message.appendChild(text);
	    textlog.appendChild(message);
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
	document.addEventListener("DOMContentLoaded", function (event) {
	    document.getElementById("text-log").addEventListener('click', function () {
	        sendmessage('privet', 'vasyan');
	    });
	    var ta = document.querySelector('#textarea');
	    ta.addEventListener('keydown', function (e) {
	        textAreaInputHandler(e, ta);
	    });
	});
	function textAreaInputHandler(e, ta) {
	    if (e.keyCode == '13') {
	        e.preventDefault();
	        if (e.ctrlKey) {
	            ta.value += '\n';
	            return;
	        }
	        else {
	            sendmessage(ta.value, current_chat);
	            ta.value = "";
	        }
	    }
	}


/***/ }
/******/ ]);