const users = []
const addUser = (username) => {
  const name = username.trim().toLowerCase()
  const existingUser = users.find((user) => user === name)
  if (!username.trim()) return { error: 'name is required' }
  if (existingUser) {
    return { error: 'username is already taken' }
  } else {
    users.push(name)
    return username
  }

}
const chat = (io) => {

  io.on('connection', (socket) => {
    // console.log('user connected', socket.id)
    // listening for username
    socket.on('username', (username, next) => {
      console.log(username)
      //io.emit('user joined', `${username} joined`)emits to all the client
      let result = addUser(username)
      if (result.error) {
        return next(result.error)
      } else {
        io.emit('users', users)
        socket.broadcast.emit('user joined', `${username} joined`)
        //broadcast to everyone except the current user
      }
    })
    // listening for message
    socket.on('message', message => {
      io.emit('message', message)
    })
    // disconnect
    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
  })
}

export default chat;