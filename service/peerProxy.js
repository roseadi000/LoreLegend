const { WebSocketServer, WebSocket } = require('ws');

function peerProxy(httpServer, onlineUsers) {
  // Create a websocket object
  const socketServer = new WebSocketServer({ server: httpServer });

  socketServer.on('connection', (socket) => {
    socket.isAlive = true;

    // Forward messages to everyone except the sender
    socket.on('message', function message(data) {
      const msg = JSON.parse(data);
      if (msg.type === 'userOnline') {
        socket.username = msg.user;
      }

      socketServer.clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    });

    // Respond to pong messages by marking the connection alive
    socket.on('pong', () => {
      socket.isAlive = true;
    });

    socket.on('close', () => {
      console.log(socket.username);
      const index = onlineUsers.indexOf(socket.username);
      if (index !== -1) {
        onlineUsers.splice(index, 1);
      }
      console.log('close: ', onlineUsers);
    });
  });

  // Periodically send out a ping message to make sure clients are alive
  setInterval(() => {
    socketServer.clients.forEach(function each(client) {
      if (client.isAlive === false) {
        onlineUsers = onlineUsers.filter((c) => c !== client.username);
        client.terminate();
        console.log('Die: ', onlineUsers);
        return;
      }

      client.isAlive = false;
      client.ping();
      if (!onlineUsers.includes(client.username)) {
        onlineUsers.push(client.username);
      }
    });
    console.log(onlineUsers);
  }, 10000);
}

module.exports = { peerProxy };
