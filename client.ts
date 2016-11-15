let nickname = "";
let address = "";
let connectionStatus = "disconnected";
let currentChat = "";
let ws = null;
let contacts = {};

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
    let id = "";
    let possible = "abcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < 4; i++) {
        id += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return id;
}
/**
 * Closes current chat (if the user you chatted with has disconnected)
 */
function closeCurrentChat() {
    // hide textarea
    let ia = document.getElementById("input-area");
    ia.style.display = "none";

    //replace textlog with an empty one
    let d = document.createElement("div");
    d.id = "text-log";
    let old = document.getElementById("text-log");
    old.parentNode.replaceChild(d, old);
}

/**
 * Changes current chat
 * @param {string} id Name of user you want to chat with  
 */
function changeCurrentChat(id: string) {
    // show input area if it was hidden (in case there wasn't an open chat yet)
    let ia = document.getElementById("input-area");
    ia.style.display = "initial";

    // remove current-chat class from current chat
    let previousChat = document.getElementsByClassName("current-chat")[0];
    if (previousChat) {
        previousChat.classList.remove("current-chat");
    }

    // add current-chat class to new chat
    let contact = document.getElementById(id);
    contact.classList.add("current-chat");
    contact.classList.remove("new-message");

    // change current chat
    currentChat = id;

    // create new textlog and append to it all messages from chat history
    let d = document.createElement("div");
    d.id = "text-log";
    contacts[id].log.forEach(elem => appendMessage(elem.sender, elem.message, d));
    d.scrollTop = d.scrollHeight;

    // replace the old textlog with the new one
    let old = document.getElementById("text-log");
    old.parentNode.replaceChild(d, old);
}

/**
 * Appends a message to the textlog
 * @param {string}
 * @param {string}
 * @param {HTMLDivElement}
 */
function appendMessage(from: string, msg: string, container: HTMLDivElement) {
    // create a message container
    let messageContainer = document.createElement("div");
    messageContainer.classList.add("message-container");

    // create a message div
    let message = document.createElement("div");
    message.classList.add("message");

    // create a sender div
    let sender = document.createElement("div");
    sender.classList.add("sender");

    // create text nodes
    let message_text = document.createTextNode(msg);
    let senderText = document.createTextNode(from + "\u00A0>"); // \u00A0 = non-breaking space

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
function sendMessage(msg: string, to: string) {
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
    let textlog = <HTMLDivElement>document.getElementById("text-log");
    appendMessage("Me", msg, textlog);
    textlog.scrollTop = textlog.scrollHeight;
}

// add keydown handler to textarea
document.addEventListener("DOMContentLoaded", (event: Event) => {
    let ta = <HTMLTextAreaElement>document.getElementById("textarea");
    ta.addEventListener("keydown", (e: KeyboardEvent) => textAreaInputHandler(e, ta));
});

/**
 * Handles textarea input: if Enter - send message, if Ctrl+Enter - insert a linebreak
 * @param {KeyboardEvent} e Keydown keyboard event
 * @param {HTMLElement} ta Textarea
 */
function textAreaInputHandler(e: KeyboardEvent, ta: HTMLTextAreaElement) {
    if ((e as any).keyCode == "13") {
        e.preventDefault();
        if ((e as any).ctrlKey) {
            ta.value += "\n";
            return;
        } else {
            sendMessage((ta as any).value, currentChat);
            ta.value = "";
        }
    }
}

/**
 * Checks connection status response from server
 * @param {string} status Connection status response from server 
 */
function processConnectionStatus(status: string) {
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
function processMessage(message: any) {
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
        let contact = document.getElementById(message.from);
        contact.classList.add("new-message");
        return;
    }

    // append message to the textlog
    let textlog = <HTMLDivElement>document.getElementById("text-log");
    appendMessage(message.from, message.msg, textlog);
    textlog.scrollTop = textlog.scrollHeight;
}

/**
 * Updates contact list 
 * @param {string} contactList Contact list in string format name1:name2:...
 */
function updateContactList(contactList) {
    // if there isn't an open chat - false, no need to close, else - true
    let closeCurrentChatFlag = currentChat !== "";
    let contactsArray = contactList.split(":");
    let newContacts = {};
    contactsArray.forEach((elem) => {
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
        } else {
            newContacts[elem] = {
                log: []
            };
        }
    });

    // update contacts
    contacts = newContacts;

    // update html
    let d = document.createElement("div");
    d.id = "contact-list";
    for (let elem in contacts) {
        //create a contact div
        let oldcontact = document.getElementById(elem);
        let d1 = document.createElement("div");
        let n = document.createTextNode(elem);
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
        d1.addEventListener("click", () => {
            changeCurrentChat(d1.id);
        });

        //append contact to contact list
        d.appendChild(d1);
    };
    // replace contact list
    let old = document.getElementById("contact-list");
    old.parentNode.replaceChild(d, old);

    if (closeCurrentChatFlag) {
        closeCurrentChat();
    }
}

ws.onopen = (event) => {
    ws.send(JSON.stringify({
        op: "connect",
        name: nickname
    }));
};

ws.onerror = (event) => {
    address = prompt("Couldn't reach server. Try another one:", "localhost");
    if (address) {
        ws = wsinit();
    }
};

ws.onmessage = (event) => {
    let message = JSON.parse(event.data);
    switch (message.op) {
        case "connection_status":
            processConnectionStatus(message.status);
            break;
        case "message":
            processMessage(message);
            break;
        case "update":
            updateContactList(message.contact_list);
            break;
        default: break;
    }
};
