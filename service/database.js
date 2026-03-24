const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('LoreLegend');
const users = db.collection('users');

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`Connect to database`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    client.close();
    process.exit(1);
  }
})();

//Login
async function addUser(user){
  await users.insertOne(user);
}
function getUser(field, value){
  return users.findOne({ [field]: value });
}
async function updateToken(user){
  await users.updateOne({ email: user.email }, {$set: {token: user.token}})
}

//Projects


module.exports = {
  getUser,
  addUser,
  updateToken,
};