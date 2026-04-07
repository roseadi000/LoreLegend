const { WebSocketServer, WebSocket, on } = require('ws');
const stat = require('./status.js');

function peerProxy(httpServer) {
  // Create a websocket object
  const socketServer = new WebSocketServer({ server: httpServer });
  const onlineUsers = new Map();

  socketServer.on('connection', (socket, req) => {
    socket.isAlive = true;
    console.log('Socket Alive');

    const params = new URLSearchParams(req.url.replace('/', ''));
    const currentUser = params.get('ws/?currentUser');

    if (currentUser) {
      onlineUsers.set(currentUser, socket);
      stat.userOnline(currentUser, onlineUsers);
    }

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
    });
  }, 10000);
}

module.exports = { peerProxy };
