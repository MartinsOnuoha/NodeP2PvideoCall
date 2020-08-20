const express = require('express');
const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const { resolve } = require('path');

/**
 * instantiate peerServer
 */
const peerServer = ExpressPeerServer(server, {
  debug: true
})

/**
 * app setup
 */
app.set('view engine', 'hbs')
app.use(express.static('public'))
app.use('/peer', peerServer)

/**
 * base redirect
 */
app.get('/', (req, res) => {
  res.render('index')
})

app.get('/room', (req, res) => {
  res.redirect(`/room/${uuidv4()}`)
})
/**
 * Route to specific room
*/
app.get('/room/:roomId', (req, res) => {
  res.render('room', { roomId: req.params.roomId })
})

/**
 * Socket connection
 */
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId) // join room
    socket.to(roomId).broadcast.emit('user-connected', userId)

    // new message
    socket.on('new-message', message => [
      io.to(roomId).emit('create-new-message', message)
    ])
  })
})

server.listen(process.env.port || 3030)
