import express from 'express';
const morgan = require('morgan');
import cors from 'cors';
require('dotenv').config()
import chat from './controllers/chat';

// create the server
const app = express();
const http = require('http').createServer(app);

//socket io
const io = require('socket.io')(http, {
  path: '/socket.io',
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowHeaders: ['content-type']

  }
})

// add middlewares
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));


// api

app.get('/api', (req, res) => {
  res.send({ message: "Hello world" })
})

// 
chat(io)
const port = process.env.PORT || 8000

http.listen(port, () => {
  console.log(`listening on port ${port}`)
})