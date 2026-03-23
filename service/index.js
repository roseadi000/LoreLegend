const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const DB = require('./database.js');

const app = express();

const authCookieName = 'token';

let users = [];

const port = process.argv.length > 2 ? process.argv[2] : 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));


let apiRouter = express.Router();
app.use(`/api`, apiRouter);

//Login
//create user
apiRouter.post('/auth/create', async (req, res) => {
    if (await findUser('email', req.body.email)) {
        res.status(409).send({ msg: 'Existing user' });
    }
    else if (await findUser('username', req.body.email)) {
        res.status(409).send({ msg: 'Existing user' });
    }
    else {
        const user = await registerUser(req.body.email, req.body.password, req.body.username);

        setAuthCookie(res, user.token);
        res.send({ currentUser: user.username });
    }
});
//login user
apiRouter.post('/auth/login', async (req, res) => {
    const user = await findUser('email', req.body.email);
    if (user) {
        if (await bcrypt.compare(req.body.password, user.password)) {
            user.token = uuid.v4();
            setAuthCookie(res, user.token);
            res.send({ currentUser: user.username });
            return;
        }
    }
    res.status(401).send({ msg: 'Unauthorized' });
});
//get user
apiRouter.get('/auth/:email', async (req, res) => {
    const user = await findUser('email', req.params.email);
    res.send(user);
})
//logout user
apiRouter.delete('/auth/logout', async (req, res) => {
    const user = await findUser('token', req.cookies[authCookieName]);
    if (user) {
        delete user.token;
    }
    res.clearCookie(authCookieName);
    res.status(204).end();
});

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
    const user = await findUser('token', req.cookies[authCookieName]);
    if (user) {
        next();
    } else {
        res.status(401).send({ msg: 'Unauthorized' });
    }
};

//Projects
//get projects
apiRouter.get('/projects/:username', verifyAuth, async (req, res) => {
    const user = await findUser('username', req.params.username);
    const projects = user.projects;
    res.send(projects);
});
//create project
apiRouter.post('/projects/create', verifyAuth, async (req, res) => {
    const user = await findUser('username', req.body.username);
    createProject(req.body.name, user);
    res.send(user.projects);
});

//Characteres
//get characters
apiRouter.get('/characters/:username/:project', verifyAuth, async (req, res) => {
    const user = await findUser('username', req.params.username);
    const projects = user.projects;
    const project = projects.find((p) => p.name === req.params.project);
    res.send(project.characters);
});
//create character
apiRouter.post('/characters/create', verifyAuth, async (req, res) => {
    const user = await findUser('username', req.body.username);
    const project = user.projects.find((p) => p.name === req.body.project);
    createCharacter(req.body.name, project, user);
    res.send(project.characters);
});

//Character Sheets
//get character infomation
apiRouter.get('/character_sheets/:username/:project/:character', verifyAuth, async (req, res) => {
    const character = await findCharacter(req.params.character, req.params.project, req.params.username);
    console.log(character);
    res.send(character);
});
//save info
apiRouter.post('/character_sheets/save', verifyAuth, async (req, res) => {
    const character = await findCharacter(req.body.character, req.body.project, req.body.username);
    const item = req.body.item;
    character[item] = req.body.value;
    res.send(character);
});
//save image
const upload = multer({
    storage: multer.diskStorage({
        destination: 'uploads/',
        filename: (req, file, cb) => {
            const filetype = file.originalname.split('.').pop();
            const id = Math.round(Math.random() * 1e9);
            const filename = `${id}.${filetype}`;
            cb(null, filename);
        },
    }),
    limits: { fileSize: 1000000 },
});

apiRouter.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.send({
            message: 'Uploaded succeeded',
            file: req.file.filename,
        });

    } else {
        res.status(400).send({ message: 'Upload failed' });
    }
});

//Account
//change username
apiRouter.put('/users/username', verifyAuth, async (req, res) => {
    const user = await findUser('username', req.body.username);
    user.username = req.body.value;
    console.log(user);
    res.send(user);
});
//get user
apiRouter.get('/users/:username', verifyAuth, async (req, res) => {
    const user = await findUser('username', req.params.username);
    res.send(user);
})
//change email
apiRouter.put('/users/email', verifyAuth, async (req, res) => {
    const user = await findUser('username', req.body.username);
    user.email = req.body.value;
    console.log(user);
    res.send(user);
});
//change password
apiRouter.put('/users/password', verifyAuth, async (req, res) => {
    const user = await findUser('username', req.body.username);
    if (await bcrypt.compare(req.body.password, user.password)) {
        const newPassword = await bcrypt.hash(req.body.password, 10);
        user.password = newPassword;
        console.log(user);
        res.send(user);
        return;
    }
    res.status(401).send({ msg: 'Unauthorized' });
});

//Friends
//get friends
apiRouter.get('/friends/:username', verifyAuth, async (req, res) => {
    const user = await findUser('username', req.params.username);
    const friends = user.friends;
    res.send(friends);
});
//get friend requests
apiRouter.get('/friendRequests/:username', verifyAuth, async (req, res) => {
    const user = await findUser('username', req.params.username);
    const friendRequests = user.friendRequests;
    res.send(friendRequests);
});
//create/send friend request
apiRouter.post('/friends/send', verifyAuth, async (req, res) => {
    const user = await findUser('username', req.body.username);
    const toUser = await findUser('username', req.body.to);
    const request = await manageFriendRequest(toUser, user);
    toUser.friendRequests.push(request);
    res.send(toUser.friendsRequests);
});
//add friend
apiRouter.post('/friends/add', verifyAuth, async (req, res) => {
    const user = await findUser('username', req.body.username);
    const newFriend = await findUser('username', req.body.request.from);
    
    if (newFriend) {
        user.friends.push(newFriend.username);
        newFriend.friends.push(user.username);
    }
    else {
        user.friends.push(req.body.request.from);
    }    
    
    res.send(user.friends);
});
//delete friend request
apiRouter.delete('/friendRequests/:username/:requestID', verifyAuth, async(req, res) => {
    const user = await findUser('username', req.params.username);
    const requestID = req.params.requestID;
    const updateRequests = user.friendRequests.filter((r) => r.id !== requestID); 
    user.friendRequests = updateRequests;

    res.send(user.friendRequests);
})
//save friend request
apiRouter.post('/friends/save', verifyAuth, async (req, res) => {
    const user = await findUser('username', req.body.username);
    if (user) {
    const requests = user.friendRequests;

    requests.push(req.body.request);
    res.send(requests);
}
});


//Login functions
async function registerUser(email, password, username) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        email: email,
        password: hashedPassword,
        username: username,
        projects: [],
        friends: [],
        friendRequests: [],
        token: uuid.v4(),
    };

    await DB.addUser(user);
    //users.push(newUser);
    return newUser;
}

function setAuthCookie(res, authToken) {
    res.cookie(authCookieName, authToken, {
        maxAge: 1000 * 60 * 60 * 24 * 365,
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
    });
}

async function findUser(field, value) {
    if (!value) return null;

    return users.find((u) => u[field] === value);
}

//Project functions
async function createProject(name, user) {
    const projects = user.projects
    const newProject = {
        name,
        date: new Date().toLocaleDateString(),
        characters: [],
    };

    projects.push(newProject);
    return newProject;
}

//Character functions
async function createCharacter(name, project, user) {
    const characters = project.characters
    const newCharacter = {
        name,
        date: new Date().toLocaleDateString(),
        fullName: '',
        age: '',
        gender: '',
        height: '',
        birthday: '',
        species: '',
        imageURL: '/character_placeholder.png',
        personality: '',
        strengths: '',
        weaknesses: '',
    };

    characters.push(newCharacter);
    return newCharacter;
}

//character_sheets functions
async function findCharacter(name, projectName, username) {
    const user = await findUser('username', username);
    const project = user.projects.find((p) => p.name === projectName);
    const character = project.characters.find((c) => c.name === name);
    console.log(character);
    return character;
}


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

//Friends functions
//create/send friend request
async function manageFriendRequest(name, user) {
    const toRequests = name.friendRequests;

    const friendRequest = {
        id: crypto.randomUUID(),
        from: user.username,
        to: name.username,
        time: new Date().toLocaleDateString(),
    }

    return friendRequest;
}
