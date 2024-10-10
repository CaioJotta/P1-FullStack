import { io } from "socket.io-client";

const token = localStorage.getItem('token');


const socket = io('http://localhost:3000', {
  auth: {
    token: token 
  }
});


document.getElementById('createRoomButton').addEventListener('click', async () => {
  const name = document.getElementById('roomName').value;
  const description = document.getElementById('roomDescription').value;
  const capacity = document.getElementById('roomCapacity').value;

  try {
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ name, description, capacity })
    });

    const data = await response.json();
    if (response.ok) {
      alert(`Sala criada com sucesso! ID: ${data.roomId}`); 
    } else {
      alert(`Erro: ${data.message}`);
    }
  } catch (error) {
    console.error('Erro ao criar sala:', error);
  }
});


document.getElementById('enterRoomButton').addEventListener('click', () => {
  const roomName = document.getElementById('roomInput').value;
  if (roomName) {
    socket.emit('joinRoom', roomName);
  }
});


document.getElementById('sendButton').addEventListener('click', () => {
  const message = document.getElementById('messageInput').value;
  if (message) {
    socket.emit('sendMessage', message);
    document.getElementById('messageInput').value = '';
  }
});


socket.on('receiveMessage', (message) => {
  const messageContainer = document.getElementById('messages');
  const newMessage = document.createElement('li');
  newMessage.textContent = message;
  messageContainer.appendChild(newMessage);
});
