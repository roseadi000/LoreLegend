import React from 'react';
import './friend_requests.css';
import { BrowserRouter, NavLink, useNavigate, Routes } from 'react-router-dom';
import { Projects } from '../projects/projects';

export function Friend_Requests() {
    const navigate = useNavigate();
    const currentUser = localStorage.getItem('currentUser');
    /*const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find((u) => u.username === currentUser.username);*/
    const [friendRequests, setFriendRequests] = React.useState([]);

    React.useEffect(() => {
        fetch(`/api/friendRequests/${currentUser}`)
            .then(async (response) => {
                if (response?.status === 200) {
                    const requestRes = await response.json();
                    setFriendRequests(requestRes);
                }
                else if (response?.status === 401) {
                    navigate('/');
                }
            })
    }, []);

    async function accept(request) {
        const response = await fetch('/api/friends/add', {
            method: 'post',
            body: JSON.stringify({ request: request, username: currentUser }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        if (response?.status === 200) {
            console.log("Added");
        } else {
            throw new Error('Failed to add friend');
        }
        const response2 = await fetch(`/api/friendRequests/${currentUser}/${request.id}`, {
            method: 'delete',
        });
        if (response2?.status === 200) {
            console.log(friendRequests);
            fetch(`/api/friendRequests/${currentUser}`)
                .then((response) => response.json())
                .then((requests) => {
                    setFriendRequests(requests);

                });
        } else {
            throw new Error('Failed to delete request');
        }
    }

    async function decline(request) {
        const response = await fetch(`/api/friendRequests/${currentUser}/${request.id}`, {
            method: 'delete',
        });
        if (response?.status === 200) {
            console.log(friendRequests);
            fetch(`/api/friendRequests/${currentUser}`)
                .then((response) => response.json())
                .then((requests) => {
                    setFriendRequests(requests);

                });
        } else {
            throw new Error('Failed to delete request');
        }
    }

    return (
        <main>
            <NavLink to='/projects' id="fileLink">Back to Projects</NavLink>
            <p></p>
            <div><NavLink to='/friends' id='fileLink'>Friends</NavLink> | <b>Requests</b></div>
            <div id="requestOrganizer">
                <div id="requestName"><b>Name</b></div>
                <div id="requestDate"><b>Date</b></div>
            </div>
            {friendRequests.map(request => (
                <div key={request.id} id='requestOrganizer'>
                    <div id="requestName">{request.from}</div>
                    <div id="requestDate">{request.time}</div>
                    <input type='button' value='Accept' onClick={() => accept(request)} />
                    <input type='button' value='Decline' onClick={() => decline(request)} />
                </div>
            ))}
        </main>
    );
}