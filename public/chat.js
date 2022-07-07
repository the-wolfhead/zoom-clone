const socke = io('/new')
const videoGrid = document.getElementById('video-grid')
const myPeer= new Peer(undefined, {
    host:'/new',
    port: '3001'
})
const myVideo= document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    addVideoStream(myVideo, stream)

myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
       
    })

    socke.on('user-connected', userId=> {
        connectToNewUser(userId, stream)
    })
})

socke.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id=>{
    socke.emit('join-room', ROOM_ID, id)
})


function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on ('close', () => {
        video.remove()
    })
    peers[userId] = call
}
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

//Make connection
var socket = io.connect('http://localhost:3000');

//Query DOM
var message = document.getElementById('message');
    handle = document.getElementById('handle'),
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    feedback = document.getElementById('feedback');

    //EMIT EVENTS

    btn.addEventListener('click', function(){
        socket.emit('chat', {
            message: message.value, 
            handle: handle.value
        });
    });

    message.addEventListener('keypress', function(){
        socket.emit('typing', handle.value);
    })

    //Listen for events
    socket.on('chat', function(data){
        output.innerHTML += '<p><strong>'+ data.handle + ':</strong>'+ data.message + '</p>';
    })

    socket.on('typing', function(data){
        feedback.innerHTML = '<p><em>'+ data+ ' is typing a message...</em></p>';
    })