const socket = io();
let peerConnection;
let localStream;
let room;

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

async function joinRoom() {
  room = document.getElementById('roomInput').value;
  if (!room) return alert('Ingresa el nombre de una sala');
  await startStream();
  socket.emit('join', room);
}

async function startStream() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;
  peerConnection = createPeerConnection();
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
}

function createPeerConnection() {
  const pc = new RTCPeerConnection();
  
  pc.onicecandidate = event => {
    if (event.candidate) {
      socket.emit('candidate', event.candidate);
    }
  };

  pc.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
  };

  return pc;
}

socket.on('ready', async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit('offer', offer);
});

socket.on('offer', async (offer) => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit('answer', answer);
});

socket.on('answer', (answer) => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('candidate', (candidate) => {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});
