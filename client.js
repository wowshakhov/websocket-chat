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

	var nickname = '';
	var address = '';
	var connection_status = 'disconnected';
	var current_chat = '';
	var ws = null;
	var contacts = {};
	nickname = prompt("Username: ", "vasyan");
	address = prompt("Server address:", 'localhost');
	wsinit(nickname, address);
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
	        if (address) {
	            wsinit(nickname, address);
	        }
	    };
	    ws.onmessage = function (event) {
	        var message = JSON.parse(event.data);
	        switch (message.op) {
	            case 'connection_status':
	                switch (message.status) {
	                    case 'connected':
	                        connection_status = 'connected';
	                        break;
	                    case 'name_already_taken':
	                        nickname = prompt("Name already taken. Try another one:", "");
	                        if (nickname) {
	                            wsinit(nickname, address);
	                        }
	                        break;
	                    case 'invalid_name':
	                        nickname = prompt("Invalid name. Try another one:", "");
	                        if (nickname) {
	                            wsinit(nickname, address);
	                        }
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
	                    var contact = document.getElementById(message.from);
	                    contact.classList.add('new-message');
	                    break;
	                }
	                var textlog = document.getElementById("text-log");
	                appendMessage(message.from, message.msg, textlog);
	                textlog.scrollTop = textlog.scrollHeight;
	                break;
	            case 'update':
	                var closeCurrentChatFlag_1 = current_chat != '';
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
	                    d1.classList.add('contact');
	                    if (oldcontact && oldcontact.classList.contains('current_chat')) {
	                        d1.classList.add('current_chat');
	                    }
	                    if (oldcontact && oldcontact.classList.contains('new-message')) {
	                        d1.classList.add('new-message');
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
	    var d = document.createElement("div");
	    d.id = "text-log";
	    var old = document.getElementById("text-log");
	    old.parentNode.replaceChild(d, old);
	}
	function changeCurrentChat(id) {
	    var ia = document.getElementById('input-area');
	    ia.style.display = 'initial';
	    var previous_chat = document.getElementsByClassName('current_chat')[0];
	    if (previous_chat) {
	        previous_chat.classList.remove('current_chat');
	    }
	    var contact = document.getElementById(id);
	    contact.classList.add('current_chat');
	    contact.classList.remove('new-message');
	    current_chat = id;
	    var d = document.createElement("div");
	    d.id = "text-log";
	    contacts[id].log.forEach(function (elem) {
	        appendMessage(elem.sender, elem.message, d);
	    });
	    d.scrollTop = d.scrollHeight;
	    var old = document.getElementById("text-log");
	    old.parentNode.replaceChild(d, old);
	}
	function appendMessage(from, msg, textlog) {
	    var message_container = document.createElement("div");
	    message_container.classList.add('message_container');
	    var message_ = document.createElement("div");
	    message_.classList.add('message');
	    var sender = document.createElement("div");
	    sender.classList.add('sender');
	    var message_text = document.createTextNode(msg);
	    var sender_text = document.createTextNode(from + '\u00A0>'); // u00A0 = &nbsp;
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
	    var textlog = document.getElementById("text-log");
	    appendMessage('Me', msg, textlog);
	    textlog.scrollTop = textlog.scrollHeight;
	}
	document.addEventListener("DOMContentLoaded", function (event) {
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