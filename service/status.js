const DB = require('./database.js');

async function userOnline(username, onlineUsers) {
    const user = await DB.getUser('username', username);

    user.friends.forEach(friend => {
        const friendSocket = onlineUsers.get(friend.username);
        if (friendSocket){
            friendSocket.send(JSON.stringify({
                name: username,
                status: 'Online',
            }));
        }
    })
}

module.exports = {
    userOnline,
}