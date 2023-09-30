const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const fs = require('fs')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static('public'))

app.get('/', (req, res)=>{
  fs.readFile(__dirname+'/public/index.html', 'utf-8', (err, data)=>{
    if(!err){
      res.send(data)
    }else{
      console.error(err)
      res.status(500).send('an error ocurred while reading the index file')
      return
    }
  })
})

io.on('connection', (socket)=>{
    console.log('A user connected');

    socket.on('joinRoom', (roomName, user)=>{
        socket.join(roomName)
        io.to(roomName).emit('message', `Chat: ${user} joined`)
        console.log(`${user} joined room: ${roomName}`)
     })

    socket.on('chat message', (message)=>{
      io.emit('chat message', message)
    })

    socket.on('broadcastToRoom', (roomName, message, from) => {
      io.to(roomName).emit('message', `${from}: ${message}`, from);
      console.log(`Broadcasted to room ${roomName}: ${message}`);
    });

    socket.on('broadcastImageToRoom', (roomName, url, from)=>{
      io.to(roomName).emit('sendImage', from, url)
      console.log('Broadcasted image to room')
    })

    socket.on('leaveRoom', (roomName, user)=>{
      socket.leave(roomName)
      console.log(`${user} left room: ${roomName}`)
    })

    socket.on('changeRoom', (currentRoom, newRoom)=>{
      socket.leave(currentRoom)
      socket.join(newRoom)
      console.log(`User left room: ${currentRoom}`)
      console.log(`User joined room: ${newRoom}`)
    })

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
})

server.listen(3000)