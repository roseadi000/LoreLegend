import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Login } from './login/login';
import { Projects } from './projects/projects';
import { Characters } from './characters/characters';
import { Character_Sheets } from './character_sheets/character_sheets';
import { Friends } from './friends/friends';
import { Account } from './account/account';
import { Friend_Requests } from './friend_requests/friend_requests';


export default function App() {
    const [user, setUser] = React.useState(null);
    const [currentUser, setCurrentUser] = React.useState((localStorage.getItem('currentUser') || null));
    const [onlineUsers, setOnlineUsers] = React.useState([]);
    

    return (
        <BrowserRouter>
            <div className="bodyDisplay">
                <header>
                    <div id="Logo">Lore Legend</div>
                    <div id="Menu"><NavLink to="friends" id="menuLink">Friends</NavLink></div>
                    <div id="User"><NavLink to='account' id='menuLink'>{currentUser ? `${currentUser}` : 'Please log in'}</NavLink></div>
                </header>

                <Routes>
                    <Route path='/' element={<Login setUser={setUser} setCurrentUser={setCurrentUser} setOnlineUsers={setOnlineUsers} onlineUsers={ onlineUsers } />} exact />
                    <Route path='/friends' element={<Friends onlineUsers={onlineUsers} />} />
                    <Route path='/friend_requests' element={<Friend_Requests />} />
                    <Route path='/account' element={<Account setUser={setUser} setCurrentUser={setCurrentUser} />} />
                    <Route path='/projects' element={<Projects />} />
                    <Route path='/projects/:projectName' element={<Characters />} />
                    <Route path='/projects/:projectName/:characterName' element={<Character_Sheets />} />
                    <Route path='*' element={<NotFound />} />
                </Routes>

                <footer>
                    <div id="myName">Adilyn Rose</div>
                    <a href="https://github.com/roseadi000/CS260-Startup.git" id="gitHub">GitHub</a>
                </footer>
            </div>
        </BrowserRouter>
    );
}

function NotFound() {
    return <main className="container-fluid bg-secondary text-center">404: Unknown address.</main>;
}
