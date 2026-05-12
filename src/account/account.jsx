import React from 'react';
import './account.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { Popup } from '../scripts.jsx';
import { offlineUser } from '../status.js';

export function Account({ setUser, setCurrentUser }) {
  //const users = JSON.parse(localStorage.getItem('users'));
  const currentUser = localStorage.getItem('currentUser');
  /*const user = users.find((u) => u.username === currentUser.username);*/
  const navigate = useNavigate();

  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [newUsername, setNewUsername] = React.useState('');
  const [isPopupOpenUsername, setPopupOpenUsername] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState('');
  const [isPopupOpenEmail, setPopupOpenEmail] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [isPopupOpenPassword, setPopupOpenPassword] = React.useState(false);

  React.useEffect(() => {
    fetch(`/api/users/${currentUser}`)
      .then(async (response) => {
        if (response?.status === 200) {
          const usernameRes = await response.json();
          setUsername(usernameRes.username);
          setEmail(usernameRes.email);
        }
        else if (response?.status === 401) {
          navigate('/');
        }
      })
  }, [])

  async function updateInfo(text, endpoint, closePopup, item) {
    const response = await fetch(endpoint, {
      method: 'put',
      body: JSON.stringify({ value: text, username: currentUser, password: password, newPassword: newPassword }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    if (response?.status === 200) {
      if (item === 'username') {
        localStorage.setItem('currentUser', newUsername);
        setUsername(newUsername);
      }
      else if (item === 'email') {
        setEmail(newEmail);
      }
      else {
        setPassword('');
        setNewPassword('');
      }

    }
    else if (response?.status === 401) {
      alert("Incorrect Password");
    }
    else {
      throw new Error('Failed to save info');
    }
    closePopup(false);
  }

  function logout() {
    fetch(`/api/auth/logout`, {
      method: 'delete',
    })
    localStorage.removeItem('currentUser');
    setUser(null);
    setCurrentUser(null);
    offlineUser();
    navigate('/');
  }

  return (
    <main>
      <NavLink to='projects' id='fileLink'>Back to Projects</NavLink>
      <p></p>
      <div id="accountType"><b>Username</b></div>
      <div id="projectOrganizer">
        <div id='accountValue'>{username}</div>
        <input type='button' value='Change' id="changeButton" onClick={() => setPopupOpenUsername(true)}></input>
      </div>
      <div id="accountType"><b>Email</b></div>
      <div id="projectOrganizer">
        <div id='accountValue'>{email}</div>
        <input type='button' value='Change' id="changeButton" onClick={() => setPopupOpenEmail(true)}></input>
      </div>
      <div id="accountType"><b>Password</b></div>
      <div id="projectOrganizer">
        <div id='accountValue'>****</div>
        <input type='button' value='Change' id="changeButton" onClick={() => setPopupOpenPassword(true)}></input>
      </div>
      <p></p>
      <input type='button' value='Logout' onClick={logout}></input>

      <Popup isOpen={isPopupOpenUsername} onClose={() => setPopupOpenUsername(false)}>
        <div id='fileHeaders'>Update Username</div>
        <lable for="usernameBox">New Username: </lable>
        <input type="text" id="usernameBox" onChange={(e) => setNewUsername(e.target.value)} />
        <p></p>
        <input type='button' value='Update' onClick={() => updateInfo(newUsername, '/api/users/username', setPopupOpenUsername, "username")} />
      </Popup>
      <Popup isOpen={isPopupOpenEmail} onClose={() => setPopupOpenEmail(false)}>
        <div id='fileHeaders'>Update Email</div>
        <lable for="emailBox">New Email: </lable>
        <input type="text" id="emailBox" onChange={(e) => setNewEmail(e.target.value)} />
        <p></p>
        <input type='button' value='Update' onClick={() => updateInfo(newEmail, '/api/users/email', setPopupOpenEmail, "email")} />
      </Popup>
      <Popup isOpen={isPopupOpenPassword} onClose={() => setPopupOpenPassword(false)}>
        <div id='fileHeaders'>Update Password</div>
        <lable for="cPasswordBox">Current Password: </lable>
        <input type="password" id="cPassowrdlBox" onChange={(e) => setPassword(e.target.value)} />
        <lable for="nPasswordBox">New Password: </lable>
        <input type="password" id="nPasswordBox" onChange={(e) => setNewPassword(e.target.value)} />
        <p></p>
        <input type='button' value='Update' onClick={() => updateInfo(newPassword, '/api/users/password', setPopupOpenPassword, "password")} />
      </Popup>
    </main>
  );
}