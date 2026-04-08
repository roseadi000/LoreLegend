export function onlineUser(user, onlineUsers) {
    let port = window.location.port;
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    const socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);

    let events = [];

    socket.onopen = (event) => {
        events.push('online');
        onlineUsers.push(user);
        console.log('WS connected');
    }
    socket.onclose = (event) => {
        events.push('offline');
        onlineUsers.filter((u) => u !== user);
    }
    socket.onmessage = async (msg) => {
      try {
        const event = JSON.parse(await msg.data.text());
      } catch {}
    };

    return onlineUsers;

}

function handleEvent(event) {
    if (event === online) {

    }
}
