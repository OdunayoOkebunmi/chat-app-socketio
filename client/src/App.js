import { useState, useEffect } from 'react';
import socket from './socket';
import toast, { Toaster } from 'react-hot-toast';
import { css } from '@emotion/css';
import ScrollToBottom from 'react-scroll-to-bottom';

const ROOT_CSS = css({
  height: 600,
  width: window.innerWidth / 2
})


function App () {
  const [username, setUsername] = useState('');
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([])
  const [typing, setTyping] = useState('')


  // how to listen for the event
  useEffect(() => {
    socket.on('user joined', message => {
      console.log('user joined message', message)
    })
    socket.on('message', data => {
      // put messages on top of exisiting one
      setMessages((previousMessages) => [...previousMessages, {
        id: data.id,
        name: data.name,
        message: data.message
      }])
    })


    return () => {
      socket.off('user joined')
      socket.off('message')
      socket.off('users')
    }
  }, [])

  useEffect(() => {
    socket.on('user connected', user => {

      user.connected = true
      user.messages = []
      user.hasNewMessages = false
      setUsers(prevUsers => [...prevUsers, user])
      toast(`${user.username} joined`)
    })
    socket.on('users', users => {
      users.forEach((user) => {
        user.self = user.userId === socket.id
        user.connected = true
        user.messages = []
        user.hasNewMessages = false
      })
      // put current user first and sort by username
      const sortedUsers = users.sort((a, b) => {
        if (a.self) return -1
        if (b.self) return -1
        if (a.username < b.username) return -1
        return a.username > b.username ? 1 : 0;
      })

      setUsers(sortedUsers)
    })

    socket.on('username taken', () => {
      toast.error('Username taken')
    })
    return () => {
      socket.off('users')
      socket.off('user coneected')
      socket.off('username taken')
    }
  }, [])
  // listen to user disconnected event
  useEffect(() => {
    socket.on('user disconnected', id => {
      let allUsers = users
      let index = allUsers.findIndex((elem) => elem.userId === id)
      let foundUser = allUsers[index]
      foundUser.connected = false
      allUsers[index] = foundUser

      setUsers([...allUsers])

      // disconnected alert
      toast.error(`${foundUser.username} left`)

    })
    return () => {
      socket.off('user disconnected')
    }
  }, [users])


  const handleUsername = (e) => {
    e.preventDefault()
    socket.auth = { username }
    socket.connect()
    console.log(socket)
    setTimeout(() => {
      if (socket.connected) {
        console.log('socket.connected', socket)
        setConnected(true)
      }
    }, 300)

  }
  const handleMessage = (e) => {
    e.preventDefault();
    socket.emit('message', {
      id: Date.now(),
      name: username,
      message
    });
    setMessage('')
  }
  if (message) {
    socket.emit('typing', username)
  }
  useEffect(() => {
    // delay rendering of the event 
    socket.on('typing', (data) => {
      setTyping(data)
      setTimeout(() => {
        setTyping('')
      }, 1000)
    })
    return () => {
      socket.off('typing')

    }
  }, [])

  return (
    <div className="container text-center">
      <Toaster />
      <div className='row'>
        <div className='d-flex justify-content-evenly pt-2 pb-1'>
          {/* display users that are connected */ }
          { connected &&
            users.map((user) =>
              // user.connected && (
              <div key={ user.userId } className='alert alert-primary'>
                { user.username.charAt(0).toUpperCase() + user.username.slice(1) }{ " " }
                { user.self && "{ yourself}" }
                { user.connected ? (<span className='online-dot'></span>) : (<span className='offline-dot'></span>) }
              </div>
              // )
            )

          }
        </div>
      </div>

      {
        !connected && (
          <div className='row'>
            <form onSubmit={ handleUsername } className="text-center pt-3">
              <div className='row g-3' >
                <div className='col-md-8' >
                  <input
                    value={ username }
                    onChange={ (e) => setUsername(e.target.value) }
                    type="text"
                    placeholder='Enter your name'
                    className='form-control'

                  />
                </div>
                <div className='col-md-4' >
                  <button className='btn btn-secondary' type='submit'>
                    Join Chat

                  </button>
                </div>
              </div>

            </form>
          </div>
        )
      }
      <div className='row'>
        { connected && (
          <div className='col-md-6'>
            <form onSubmit={ handleMessage } className="text-center pt-3">
              <div className='row g-3' >
                <div className='col-9' >
                  <input
                    value={ message }
                    onChange={ (e) => setMessage(e.target.value) }
                    type="text"
                    placeholder='Type your message'
                    className='form-control'

                  />
                </div>
                <div className='col-3' >
                  <button className='btn btn-secondary' type='submit'>
                    Send Message

                  </button>
                </div>
              </div>

            </form>
            <br />

            <div className='col'>
              <ScrollToBottom className={ ROOT_CSS }>
                { messages.map((m) =>
                  <div key={ m.id } className='alert alert-secondary'>{ m.name.charAt(0).toUpperCase() + m.name.slice(1) } - { m.message }</div>
                ) }
              </ScrollToBottom>


              <br />
              { typing && typing }
            </div>


          </div>
        )
        }
        <br />
        <div className='col-md-4'>private chat</div>
      </div>

      <div className='row'>{ JSON.stringify(users, null, 4) }</div>

    </div>
  );
}

export default App;
