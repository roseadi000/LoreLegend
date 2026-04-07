const { WebSocketServer, WebSocket, on } = require('ws');

function peerProxy(httpServer) {
  // Create a websocket object
  const socketServer = new WebSocketServer({ server: httpServer });
  let onlineUsers = [];

  socketServer.on('connection', (socket, req) => {
    socket.isAlive = true;
    console.log('Socket Alive');

    const params = new URLSearchParams(req.url.replace('/', ''));
    console.log(params);
    const currentUser = params.get('ws/?currentUser');

    if (currentUser) {
      const onlineUser = {
        username: currentUser,
        socket: socket,
      }

      onlineUsers.push(onlineUser);
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
