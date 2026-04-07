const DB = require('./database.js');

async function userOnline(username, onlineUsers) {
    const user = await DB.getUser('username', username);

    user.friends.forEach(friend => {
        const friendSocket = onlineUsers.get(friend.username);
        if (friendSocket){
            friendSocket.send(JSON.stringify({
                type: 'friendOnline',
                friend: user.username,
            }));
        }
        console.log("Notifying friend:", friend.username);
console.log("Socket exists:", onlineUsers.has(friend.username));

    })
}
async function userOffline(username, onlineUsers) {
    const user = await DB.getUser('username', username);

    user.friends.forEach(friend => {
        const friendSocket = onlineUsers.get(friend.username);
        if (friendSocket){
            friendSocket.send(JSON.stringify({
                type: 'friendOffline',
                friend: user.username,
            }));
        }

    })
}


module.exports = {
    userOnline,
    userOffline,
}