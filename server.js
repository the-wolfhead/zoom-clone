const express = require('express');
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/new',(req, res)=>{
    res.redirect(`/new${uuidV4()}`)
})

app.get('/new:room', (req, res)=> {
    res.render('room', { roomId: req.params.room})
})

app.post('/join', (req,res)=> {
    var id = req.body.ide;
    console.log(id);
    res.render('room', { roomId: id })   
})  

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        })
    }) 
})

server.listen(process.env.PORT || 3000);
