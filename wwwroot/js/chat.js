"use strict";

var connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .withAutomaticReconnect()
    .build();

const messageInput = document.getElementById("messageInput");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const messagesList = document.getElementById("messagesList");

// Disable send button until connection is established
sendButton.disabled = true;

function createMessageElement(content, isSystem = false) {
    const li = document.createElement("li");
    li.className = `mb-2 ${isSystem ? 'text-muted' : ''}`;
    li.innerHTML = content;
    return li;
}

function clearMessageInput() {
    messageInput.value = '';
    messageInput.focus();
}

connection.on("ReceiveMessage", function (user, message, timestamp) {
    const content = `
        <strong>${user}</strong>
        <span class="text-muted small ms-2">${timestamp}</span>
        <br/>
        ${message}
    `;
    messagesList.appendChild(createMessageElement(content));
    messagesList.scrollTop = messagesList.scrollHeight;
});

connection.on("UserConnected", function (connectionId, timestamp) {
    const content = `<em>User Connected (${connectionId}) at ${timestamp}</em>`;
    messagesList.appendChild(createMessageElement(content, true));
});

connection.on("UserDisconnected", function (connectionId, timestamp) {
    const content = `<em>User Disconnected (${connectionId}) at ${timestamp}</em>`;
    messagesList.appendChild(createMessageElement(content, true));
});

// Reconnection handling
connection.onreconnecting(() => {
    sendButton.disabled = true;
    messagesList.appendChild(createMessageElement('<em>Attempting to reconnect...</em>', true));
});

connection.onreconnected(() => {
    sendButton.disabled = false;
    messagesList.appendChild(createMessageElement('<em>Reconnected successfully!</em>', true));
});

connection.start()
    .then(function () {
        sendButton.disabled = false;
        messagesList.appendChild(createMessageElement('<em>Connected to chat</em>', true));
    })
    .catch(function (err) {
        messagesList.appendChild(createMessageElement(`<em>Error: ${err.toString()}</em>`, true));
        return console.error(err.toString());
    });

// Handle send button click and Enter key press
function sendMessage() {
    const user = userInput.value.trim();
    const message = messageInput.value.trim();

    if (!user || !message) {
        alert('Please enter both username and message');
        return;
    }

    connection.invoke("SendMessage", user, message)
        .then(() => clearMessageInput())
        .catch(function (err) {
            messagesList.appendChild(createMessageElement(`<em>Error: ${err.toString()}</em>`, true));
            return console.error(err.toString());
        });
}

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}); 