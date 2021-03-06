const express = require('express');
const path = require('path');
const http = require('http');
const socket = require('socket.io');

const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socket(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Run when client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) => {

        const user = userJoin(socket.id, username, room)

        socket.join(user.room);

        //Welcome current user
        socket.emit('message', formatMessage('MinderBOT', 'Welcome to Minder!'));

        //Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit(
            'message', formatMessage('MinderBOT', `${user.username} <i> has joined the chat</i>`)
        );

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

    });

    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {

        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //Runs when client disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user){
            io.to(user.room).emit('message', formatMessage('MinderBOT',`${user.username}<i> has left the chat</i>`));
        }

    });

});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));