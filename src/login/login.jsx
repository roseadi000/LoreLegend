import React from 'react';
import './login.css';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Projects } from '../projects/projects';
import { Popup } from '../scripts';
import { onlineUser } from '../status.js';

export function Login({ setUser, setCurrentUser }) {
  const [isPopupOpen, setPopupOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const navigate = useNavigate();

  async function register(event) {
    event.preventDefault();

    const response = await fetch('/api/auth/create', {
      method: 'post',
      body: JSON.stringify({ email: email, password: password, username: username }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    if (response?.status === 200) {
      localStorage.setItem('currentUser', username);
      setCurrentUser(username);
      navigate('/projects');
    } else {
      throw new Error('Failed to register user');
    }

    setPopupOpen(false);
  }
  async function login() {
    const response = await fetch('/api/auth/login', {
      method: 'post',
      body: JSON.stringify({ email: email, password: password }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    if (response?.status === 200) {
      fetch(`/api/auth/${email}`)
        .then((response) => response.json())
        .then((user) => {
          localStorage.setItem('currentUser', user.username);
          setUsername(user.username);
          setCurrentUser(user.username);
          onlineUser(user.username);
      navigate('/projects');

        });
    } else {
      alert("Incorrect Username or Password");
    }
  }

  return (
    <main id="Main">
      <h2>Welcome to Lore Legend!</h2>
      <p>Login here!</p>
      <input type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <p></p>
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <p></p>
      <input type='button' value='Login' onClick={login}></input>
      <input type='button' value='Sign Up' onClick={() => setPopupOpen(true)}></input>

      <Popup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)}>
        <div id='fileHeaders'>Create New Account</div>
        <input type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <p></p>
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <p></p>
        <input type='text' placeholder='Username' onChange={(e) => setUsername(e.target.value)}></input>
        <p></p>
        <input type='button' value='Sign Up' onClick={register}></input>
      </Popup>
    </main>
  );
}