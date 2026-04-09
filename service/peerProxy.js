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
      else if (msg.type === 'userOffline') {
        onlineUsers.filter((u) => u !== msg.user);
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
  });

  // Periodically send out a ping message to make sure clients are alive
  setInterval(() => {
    socketServer.clients.forEach(function each(client) {
      if (client.isAlive === false) return client.terminate();

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
