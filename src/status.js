let socket = null;

export function onlineUser(user) {
    let port = window.location.port;
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);
    socket.onopen = (event) => {
        socket.send(JSON.stringify({ type: 'userOnline', user: user }));

    }
}

export function offlineUser() {
    socket.close();
}


