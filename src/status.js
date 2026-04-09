export function onlineUser(user) {
    let port = window.location.port;
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    const socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);

    let onlineUsers = [];
    let events = [];

    console.log(user);
    socket.onopen = (event) => {
        socket.send(JSON.stringify({type: 'user', user: user}));
        events.push('online');
        onlineUsers.push(user);
        console.log('WS connected');
        socket.send(JSON.stringify(onlineUsers));

    }
    socket.onclose = (event) => {
        events.push('offline');
        onlineUsers.filter((u) => u !== user);
                socket.send(JSON.stringify(onlineUsers));

    }
    socket.onmessage = async (msg) => {
      try {
        const event = JSON.parse(await msg.data.text());
        handleEvent(event);
      } catch {}
    };
}

function handleEvent(event) {
    onlineUsers = event;
    console.log(onlineUsers);
}
