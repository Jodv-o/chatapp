const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const fs = require('fs')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static('public'));

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

    socket.on('joinRoom', (roomName)=>{
        socket.join(roomName)
        console.log(`User joined room: ${roomName}`)
     })

    socket.on('chat message', (message)=>{
      io.emit('chat message', message)
    })

    socket.on('broadcastToRoom', (roomName, message) => {
      io.to(roomName).emit('message', message);
      console.log(`Broadcasted to room ${roomName}: ${message}`);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
})

server.listen(3000)