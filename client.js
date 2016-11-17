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

	var nickname = "";
	var address = "";
	var connectionStatus = "disconnected";
	var currentChat = "";
	var ws = null;
	var contacts = {};
	nickname = prompt("Username: ", makeid());
	address = prompt("Server address:", "localhost");
	if (nickname && address) {
	    ws = wsinit();
	}
	/**
	 * Connects to a server
	 * @returns {WebSocket}
	 */
	function wsinit() {
	    return new WebSocket("ws://" + address + ":8080/");
	}
	/**
	 * Generates a placeholder username
	 * @returns {string} A 4-letter username
	 */
	function makeid() {
	    var id = "";
	    var possible = "abcdefghijklmnopqrstuvwxyz";
	    for (var i = 0; i < 4; i++) {
	        id += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    return id;
	}
	/**
	 * Closes current chat (if the user you chatted with has disconnected)
	 */
	function closeCurrentChat() {
	    // hide textarea
	    var ia = document.getElementById("input-area");
	    ia.style.display = "none";
	    //replace textlog with an empty one
	    var d = document.createElement("div");
	    d.id = "text-log";
	    var old = document.getElementById("text-log");
	    old.parentNode.replaceChild(d, old);
	}
	/**
	 * Changes current chat
	 * @param {string} id Name of user you want to chat with
	 */
	function changeCurrentChat(id) {
	    // show input area if it was hidden (in case there wasn't an open chat yet)
	    var ia = document.getElementById("input-area");
	    ia.style.display = "initial";
	    // remove current-chat class from current chat
	    var previousChat = document.getElementsByClassName("current-chat")[0];
	    if (previousChat) {
	        previousChat.classList.remove("current-chat");
	    }
	    // add current-chat class to new chat
	    var contact = document.getElementById(id);
	    contact.classList.add("current-chat");
	    contact.classList.remove("new-message");
	    // change current chat
	    currentChat = id;
	    // create new textlog and append to it all messages from chat history
	    var d = document.createElement("div");
	    d.id = "text-log";
	    contacts[id].log.forEach(function (elem) { return appendMessage(elem.sender, elem.message, d); });
	    d.scrollTop = d.scrollHeight;
	    // replace the old textlog with the new one
	    var old = document.getElementById("text-log");
	    old.parentNode.replaceChild(d, old);
	}
	/**
	 * Appends a message to the textlog
	 * @param {string}
	 * @param {string}
	 * @param {HTMLDivElement}
	 */
	function appendMessage(from, msg, container) {
	    // create a message container
	    var messageContainer = document.createElement("div");
	    messageContainer.classList.add("message-container");
	    // create a message div
	    var message = document.createElement("div");
	    message.classList.add("message");
	    // create a sender div
	    var sender = document.createElement("div");
	    sender.classList.add("sender");
	    // create text nodes
	    var message_text = document.createTextNode(msg);
	    var senderText = document.createTextNode(from + "\u00A0>"); // \u00A0 = non-breaking space
	    // add new message
	    sender.appendChild(senderText);
	    message.appendChild(message_text);
	    messageContainer.appendChild(sender);
	    messageContainer.appendChild(message);
	    container.appendChild(messageContainer);
	}
	/**
	 * Sends message and appends it to the textlog
	 * @param {string} msg Message
	 * @param {string} to Addressee
	 */
	function sendMessage(msg, to) {
	    if (connectionStatus !== "connected") {
	        return;
	    }
	    // send message
	    ws.send(JSON.stringify({
	        op: "sendmsg",
	        from: nickname,
	        to: to,
	        msg: msg
	    }));
	    // append message to the message history
	    contacts[to].log.push({
	        sender: "Me",
	        message: msg
	    });
	    // append message to the textlog
	    var textlog = document.getElementById("text-log");
	    appendMessage("Me", msg, textlog);
	    textlog.scrollTop = textlog.scrollHeight;
	}
	// add keydown handler to textarea
	document.addEventListener("DOMContentLoaded", function (event) {
	    var ta = document.getElementById("textarea");
	    ta.addEventListener("keydown", function (e) { return textAreaInputHandler(e, ta); });
	});
	/**
	 * Handles textarea input: if Enter - send message, if Ctrl+Enter - insert a linebreak
	 * @param {KeyboardEvent} e Keydown keyboard event
	 * @param {HTMLElement} ta Textarea
	 */
	function textAreaInputHandler(e, ta) {
	    if (e.keyCode == "13") {
	        e.preventDefault();
	        if (e.ctrlKey) {
	            ta.value += "\n";
	            return;
	        }
	        else {
	            sendMessage(ta.value, currentChat);
	            ta.value = "";
	        }
	    }
	}
	/**
	 * Checks connection status response from server
	 * @param {string} status Connection status response from server
	 */
	function processConnectionStatus(status) {
	    switch (status) {
	        case "connected":
	            connectionStatus = "connected";
	            break;
	        case "name_already_taken":
	            nickname = prompt("Name already taken. Try another one:", "");
	            if (nickname) {
	                ws = wsinit();
	            }
	            break;
	        case "invalid_name":
	            nickname = prompt("Invalid name. Try another one:", "");
	            if (nickname) {
	                ws = wsinit();
	            }
	            break;
	    }
	}
	/**
	 * Processes new message
	 * @param {Object}
	 */
	function processMessage(message) {
	    if (connectionStatus === "disconnected") {
	        return;
	    }
	    // add message to message history
	    contacts[message.from].log.push({
	        sender: message.from,
	        message: message.msg
	    });
	    // if the message is from another chat, add the new-message class to that chat 
	    if (message.from !== currentChat) {
	        var contact = document.getElementById(message.from);
	        contact.classList.add("new-message");
	        return;
	    }
	    // append message to the textlog
	    var textlog = document.getElementById("text-log");
	    appendMessage(message.from, message.msg, textlog);
	    textlog.scrollTop = textlog.scrollHeight;
	}
	/**
	 * Updates contact list
	 * @param {string} contactList Contact list in string format name1:name2:...
	 */
	function updateContactList(contactList) {
	    // if there isn't an open chat - false, no need to close, else - true
	    var closeCurrentChatFlag = currentChat !== "";
	    var contactsArray = contactList.split(":");
	    var newContacts = {};
	    contactsArray.forEach(function (elem) {
	        // skip yourself
	        if (elem === nickname) {
	            return;
	        }
	        // set flag that closes current chat
	        if (currentChat === elem) {
	            closeCurrentChatFlag = false;
	        }
	        // if contact already exists and log isn't empty - copy log, else - create an empty log
	        if (contacts[elem] && contacts[elem].log.length) {
	            newContacts[elem] = {
	                log: contacts[elem].log
	            };
	        }
	        else {
	            newContacts[elem] = {
	                log: []
	            };
	        }
	    });
	    // update contacts
	    contacts = newContacts;
	    // update html
	    var d = document.createElement("div");
	    d.id = "contact-list";
	    var _loop_1 = function(elem) {
	        //create a contact div
	        var oldcontact = document.getElementById(elem);
	        var d1 = document.createElement("div");
	        var n = document.createTextNode(elem);
	        d1.appendChild(n);
	        d1.id = elem;
	        d1.classList.add("contact");
	        // attach css classes if there were any
	        if (oldcontact && oldcontact.classList.contains("current-chat")) {
	            d1.classList.add("current-chat");
	        }
	        if (oldcontact && oldcontact.classList.contains("new-message")) {
	            d1.classList.add("new-message");
	        }
	        // attach event listener to handle chat switching
	        d1.addEventListener("click", function () {
	            changeCurrentChat(d1.id);
	        });
	        //append contact to contact list
	        d.appendChild(d1);
	    };
	    for (var elem in contacts) {
	        _loop_1(elem);
	    }
	    ;
	    // replace contact list
	    var old = document.getElementById("contact-list");
	    old.parentNode.replaceChild(d, old);
	    if (closeCurrentChatFlag) {
	        closeCurrentChat();
	    }
	}
	ws.onopen = function (event) {
	    ws.send(JSON.stringify({
	        op: "connect",
	        name: nickname
	    }));
	};
	ws.onerror = function (event) {
	    address = prompt("Couldn't reach server. Try another one:", "localhost");
	    if (address) {
	        ws = wsinit();
	    }
	};
	ws.onmessage = function (event) {
	    var message = JSON.parse(event.data);
	    switch (message.op) {
	        case "connection_status":
	            processConnectionStatus(message.status);
	            break;
	        case "message":
	            processMessage(message);
	            break;
	        case "update":
	            updateContactList(message.contactList);
	            break;
	        default: break;
	    }
	};


/***/ }
/******/ ]);