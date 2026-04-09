import React from 'react';
import './friends.css';
import { BrowserRouter, NavLink, useNavigate, Routes } from 'react-router-dom';
import { Projects } from '../projects/projects';
import { Popup } from '../scripts';

export function Friends () {
    const navigate = useNavigate();

    const [status, setStatus] = React.useState('Offline');
    const currentUser = localStorage.getItem('currentUser');
    const [friends, setFriends] = React.useState([]);

    const [isPopupOpenSearch, setPopupOpenSearch] = React.useState(false);
    const [searchName, setSearchName] = React.useState('');
    const [isPopupOpenResult, setPopupOpenResult] = React.useState(false);
    const [onlineUsers, setOnlineUsers] = React.useState([]);

    React.useEffect(() => {
        fetch(`/api/friends/${currentUser}`)
            .then(async (response) => {
                if (response?.status === 200) {
                    const friendRes = await response.json();
                    setFriends(friendRes);
                }
                else if (response?.status === 401) {
                    navigate('/');
                }
            });

    }, []);
    React.useEffect(() => {
        function fetchOnlineUsers () {
        fetch('/api/getOnlineUsers')
            .then(async (response) => {
                if (response?.status === 200) {
                    const usersRes = await response.json();
                    setOnlineUsers(usersRes);
                }
            });
        }

        fetchOnlineUsers();
    
        const interval = setInterval(() => {
            fetchOnlineUsers();
        }, 10000);
        return () => clearInterval(interval);


    }, []);

    async function search(name) {
        fetch(`/api/users/${name}`)
            .then((response) => response.json())
            .then((foundSearch) => {
                if (foundSearch.username) {
                    setPopupOpenResult(true);
                    setPopupOpenSearch(false);
                }
            });

    }
    async function sendRequest(name) {
        setPopupOpenResult(false);
        const response = await fetch('/api/friends/send', {
            method: 'post',
            body: JSON.stringify({ to: name, username: currentUser }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        if (response?.status === 200) {
            fetch(`/api/friends/${currentUser}`)
                .then((response) => response.json())
                .then((friends) => {
                    setFriends(friends);
                });
        }
        else {
            throw new Error('Failed to generate friends');
        }

    }

    function getStatus(friend) {
        if (onlineUsers.includes(friend)) {
            return 'Online';
        }
        else {
            return 'Offline';
        }
    }

    return (
        <main>
            <NavLink to='/projects' id="fileLink">Back to Projects</NavLink>
            <p></p>
            <div id='linkOrganizer'>
                <div id='friend-request'><b>Friends</b> | <NavLink to='/friend_requests' id='fileLink'>Requests</NavLink></div>
                <div id='findFriends' onClick={() => setPopupOpenSearch(true)}>Find Friends</div>
            </div>

            <Popup isOpen={isPopupOpenSearch} onClose={() => setPopupOpenSearch(false)}>
                <div id='fileHeaders'>Find Friends</div>
                <input type='text' placeholder='Search' onChange={(e) => setSearchName(e.target.value)}></input>
                <p></p>
                <input type='button' value='Search' onClick={() => search(searchName)}></input>
            </Popup>
            <Popup isOpen={isPopupOpenResult} onClose={() => setPopupOpenResult(false)}>
                <div id='fileHeaders'>Results</div>
                <div>{searchName}</div>
                <p></p>
                <input type='button' value='Send Request' onClick={() => sendRequest(searchName)}></input>
            </Popup>

            <div id="friendOrganizer">
                <div id="Friends"><b>Name</b></div>
                <div id="Status"><b>Status</b></div>
            </div>
            {friends.map(friend => (
                <div key={friend.username} id='requestOrganizer'>
                    <div id="Friends">{friend.username}</div>
                    <div id="Status">{ getStatus(friend.username) }</div>
                </div>
            ))}
        </main>
    );
}