import React from 'react';
import './characters.css';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { Character_Sheets } from '../character_sheets/character_sheets';
import { Projects } from '../projects/projects';
import { Popup } from '../scripts';

export function Characters() {
  const navigate = useNavigate();

  const [isPopupOpen, setPopupOpen] = React.useState(false);
  const [name, setName] = React.useState('Character Name');
  const { projectName } = useParams();
  //const users = JSON.parse(localStorage.getItem('users'));
  const currentUser = localStorage.getItem('currentUser');
  /*const user = users.find((u) => u.username === currentUser.username);
  const project = user.projects.find(p => p.name === projectName);
  const characterList = project.characters;*/
  const [characterList, setCharacters] = React.useState([]);

  React.useEffect(() => {
    fetch(`/api/characters/${currentUser}/${projectName}`)
      .then(async (response) => {
        if (response?.status === 200) {
          const characterRes = await response.json();
          setCharacters(characterRes);

        }
        else if (response?.status === 401) {
          navigate('/');
        }

      })
  }, []);

  async function create() {
    const response = await fetch('/api/characters/create', {
      method: 'post',
      body: JSON.stringify({ name: name, project: projectName, username: currentUser }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    if (response?.status === 200) {
      console.log(characterList);
      fetch(`/api/characters/${currentUser}/${projectName}`)
        .then((response) => response.json())
        .then((characters) => {
          setCharacters(characters);
        });
    } else {
      throw new Error('Failed to create character');
    }
    setPopupOpen(false);
  }

  return (
    <main>
      <div id="fileHeaders"><span><NavLink to="/projects" id="fileLink">Projects</NavLink></span>- {projectName}</div>
      <input type='button' value='New Character' onClick={() => setPopupOpen(true)}></input>

      <Popup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)}>
        <div id='fileHeaders'>Create New Character</div>
        <input placeholder='Name' onChange={(e) => setName(e.target.value)}></input>
        <p></p>
        <input type='button' value='Create' onClick={create}></input>
      </Popup>

      <div id="characterOrganizer">
        <div id="Characters"><b>Name</b></div>
        <div id="Date"><b>Date Created</b></div>
      </div>
      {characterList.map(character => (
        <div key={character.name} id='projectOrganizer'>
          <div id="Projects"><NavLink to={character.name} id='fileLink'>{character.name}</NavLink></div>
          <div id="Date">{character.date}</div>
        </div>
      ))}
    </main>
  );
}