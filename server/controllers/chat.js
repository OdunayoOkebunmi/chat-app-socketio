const chat = (io) => {
  // middleware
  io.use((socket, next) => {
    const username = socket.handshake.auth.username
    if (!username) {
      return next(new Error('Invalid username'))
    }
    socket.username = username
    next()
  })

  io.on('connection', (socket) => {

    let users = []
    for (let [id, socket] of io.of('/').sockets) {
      const existingUser = users.find((u) => u.username === socket.username)
      if (existingUser) {
        socket.emit('username taken')
        socket.disconnect()
        return
      } else {
        users.push({
          userId: id,
          username: socket.username
        })
      }
    }
    socket.emit('users', users)
    // when a new user joins,notify existing user
    socket.broadcast.emit('user connected', {
      userId: socket.id,
      username: socket.username
    })
    // listening for message
    socket.on('message', data => {
      io.emit('message', data)
    })
    //  create typing event
    socket.on('typing', (username) => {
      socket.broadcast.emit('typing', `${username} is typing...`)
    })
    // disconnect
    socket.on('disconnect', () => {
      socket.broadcast.emit('user disconnected', socket.id)
    })
  })
}

export default chat;