
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


//Get username and room from URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

console.log(username, room);

const socket = io();

//Join chat room
socket.emit('joinRoom', {username, room});

//Get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
})

//Message from server
socket.on('message', message => {
    outputMessage(message);

    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    //Emit message to server
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

//Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');

    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p> 
                <p class="text">
                    ${message.text}
                </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

document.querySelector('emoji-picker')
    .addEventListener('emoji-click', event => document.querySelector(".emoji").value += ` ${event.detail.unicode}  `);

//Add room name to DOM

function outputRoomName(room) {
    roomName.innerText = room;
}

//Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => user.id === socket.id ? `<li> > <i>${user.username} (you)</i></li>` : `<li>${user.username}</li>` ).join('')}
    `
}