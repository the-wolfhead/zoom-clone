const express = require('express');
const app = express();
const serve = require('http').Server(app)
const ion = require('socket.io')(serve)
const { v4: uuidV4 } = require('uuid')
const bodyParser = require('body-parser');
const connection = require('./db');
const date = require('date-and-time');
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
    var meet_code = req.params.room;
    const now  =  new Date();
    const value = date.format(now,'YYYY/MM/DD HH:mm:ss');
    var entry = {
        M_code: meet_code,
        S_date: value,
        M_stat: "In Progress"
    }
    connection.query('INSERT INTO meeting_info SET ?', entry, function (err,result) {
        res.render('room', { roomId: req.params.room})
    })
})

app.post('/join', (req,res)=> {
    var id = req.body.ide;
    console.log(id);
    res.render('room', { roomId: id })   
})

app.get('/close', (req, res)=> {
    var meet_code = req.params.room;
    const now  =  new Date();
    const value = date.format(now,'YYYY/MM/DD HH:mm:ss');
    var entry = {
        M_code: meet_code,
        E_date: value,
        M_stat: "Ended"
    }
    connection.query('UPDATE meeting_info SET ? where M_code='+meet_code, entry,() =>{
        res.redirect('/');
    })
})

ion.on('connection', socket => {
    console.log( socket.id)
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        })
    }) 
})




var socke = require('socket.io');

//App setup

var server = app.listen(process.env.PORT || 3000, function() {
    console.log('listening to requests on port 4000');
});



//Socket setup

var socket = socke(server)
socket.on('connection', function(socke){
    console.log('Made socket connection', socke.id);

    socke.on('chat', function(data){
        socket.sockets.emit('chat', data);
    })

    socke.on('typing', function(data){
        socke.broadcast.emit('typing', data);
    })
});


