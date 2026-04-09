let userSocket = null;

export function onlineUser(user) {
    let port = window.location.port;
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    const socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);
    userSocket = socket;
    console.log(user);
    socket.onopen = (event) => {
        socket.send(JSON.stringify({ type: 'userOnline', user: user }));

    }
    socket.onclose = (event) => {
        socket.send(JSON.stringify({ type: 'userOffline', user: user }));
    }
    socket.onmessage = async (msg) => {
        try {
            const event = JSON.parse(await msg.data.text());
            handleEvent(event);
        } catch { }
    };
}

function handleEvent(event) {
    onlineUsers = event;
    console.log(onlineUsers);
}
