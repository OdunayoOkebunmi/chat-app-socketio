import { useState, useEffect } from 'react';
import socket from './socket';

function App () {
  const [username, setUsername] = useState('');
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([])


  // how to listen for the event
  useEffect(() => {
    socket.on('user joined', message => {
      console.log('user joined message', message)
    })
    socket.on('message', message => {
      // put messages on top of exisiting one
      setMessages((previousMessages) => [...previousMessages, message])
    })


    return () => {
      socket.off('user joined')
      socket.off('message')
      socket.off('users')
    }
  }, [])

  useEffect(() => {
    socket.on('users', users => {
      setUsers(users)
    })
    return () => {
      socket.off('users')
    }
  }, [])

  const handleUsername = (e) => {
    e.preventDefault()
    console.log(username)
    socket.emit('username', username)
    setConnected(true)

  }
  const handleMessage = (e) => {
    e.preventDefault();
    socket.emit('message', `${username} - ${message}`);
    setMessage('')
  }


  return (
    <div className="container text-center">
      <div className='row'>
        { connected ? (
          <form onSubmit={ handleMessage } className="text-center pt-3">
            <div className='row g-3' >
              <div className='col-md-8' >
                <input
                  value={ message }
                  onChange={ (e) => setMessage(e.target.value) }
                  type="text"
                  placeholder='Type your message'
                  className='form-control'

                />
              </div>
              <div className='col-md-4' >
                <button className='btn btn-secondary' type='submit'>
                  Send Message

                </button>
              </div>
            </div>

          </form>
        ) :
          (<form onSubmit={ handleUsername } className="text-center pt-3">
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

          </form>)
        }
      </div>
      <div className='row'>
        <div className='col-md-8'>
          <pre>
            { messages.map((m, index) =>
              <div key={ index } className='alert alert-secondary'>{ m }</div>
            ) }
          </pre>
        </div>
        <div className='col-md-4'>
          <pre>
            { users.map((u, index) =>
              <div key={ index } className='alert alert-primary'>{ u }</div>
            ) }
          </pre>
        </div>

      </div>


    </div>
  );
}

export default App;
