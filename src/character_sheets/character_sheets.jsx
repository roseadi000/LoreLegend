import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import 'bootstrap/dist/css/bootstrap.min.css';
import './character_sheets.css';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { Characters } from '../characters/characters';
import { saveFullName, saveAge, saveGender, saveHeight, saveBirthday, saveSpecies, savePersonality, saveStrengths, saveWeaknesses, getRandomName, saveImage } from '../service.js';
import { Popup } from '../scripts.jsx';

export function Character_Sheets() {
    const navigate = useNavigate();

    const { projectName, characterName } = useParams();
    //const users = JSON.parse(localStorage.getItem('users'));
    const currentUser = localStorage.getItem('currentUser');
    /*const user = users.find((u) => u.username === currentUser.username);
    const project = user.projects.find(p => p.name === projectName);
    const character = project.characters.find(c => c.name === characterName);*/
    const [character, setCharacter] = React.useState('');

    const [fullName, setFullName] = React.useState('');
    const [age, setAge] = React.useState('');
    const [gender, setGender] = React.useState('');
    const [height, setHeight] = React.useState('');
    const [birthday, setBirthday] = React.useState('');
    const [species, setSpecies] = React.useState('');
    const [image, setImage] = React.useState('/character_placeholder.png');

    const [personality, setPersonality] = React.useState('');
    const [strengths, setStrengths] = React.useState('');
    const [weaknesses, setWeaknesses] = React.useState('');

    const [isPopupOpen, setPopupOpen] = React.useState(false);
    const [randomNameGender, setRandomNameGender] = React.useState('');

    React.useEffect(() => {
        fetch(`/api/character_sheets/${currentUser}/${projectName}/${characterName}`)
            .then(async (response) => {
                if (response?.status === 200) {
                    const characterRes = await response.json()
                    setCharacter(characterRes);
                    setFullName(characterRes.fullName);
                    setAge(characterRes.age);
                    setGender(characterRes.gender);
                    setHeight(characterRes.height);
                    setBirthday(characterRes.birthday);
                    setSpecies(characterRes.species);
                    setImage(characterRes.imageURL);
                    setPersonality(characterRes.personality);
                    setStrengths(characterRes.strengths);
                    setWeaknesses(characterRes.weaknesses);
                    setImage(characterRes.imageURL);
                }
                else if (response?.status === 401) {
                    navigate('/');
                }
            })
    }, []);

    async function convertImage(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (response.ok) {
            const imageFile = data.file;
            saveInfo(imageFile, setImage, "imageURL");
        } else {
            alert(data.message);
        }

    }

    async function saveInfo(text, setFunc, item) {
        const response = await fetch('/api/character_sheets/save', {
            method: 'post',
            body: JSON.stringify({ value: text, item: item, project: projectName, character: characterName, username: currentUser }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        if (response?.status === 200) {
            fetch(`/api/character_sheets/${currentUser}/${projectName}/${characterName}`)
                .then((response) => response.json())
                .then((character) => {
                    setCharacter(character);
                    setFunc(character[item]);

                });
        } else {
            throw new Error('Failed to save info');
        }
    }

    async function generateName() {
        getGender();
        fetch(`https://randomuser.me/api/?gender=${randomNameGender}`)
            .then((response) => response.json())
            .then((data) => {
                const nameResponse = data.results[0];
                const newName = `${nameResponse.name.first} ${nameResponse.name.last}`;
                setFullName(newName);
                saveInfo(newName, setFullName, "fullName");
            })
            .catch();
        setPopupOpen(false);
    }

    function getGender() {
        const options = document.getElementsByName('nameGender');

        for (let i = 0; i < options.length; i++) {
            if (options[i].checked) {
                setRandomNameGender(options[i].value);
            }
        }
    }

    return (
        <main>
            <div id="fileHeaders"><span><NavLink to='/projects' id='fileLink'>Projects</NavLink></span>- <span><NavLink to={`/projects/${projectName}`} id="fileLink">{projectName}</NavLink></span>- {characterName}</div>
            <div id="Organizer">
                <div id="mainOrganizer">
                    <div id="headInfo">
                        <div id="imageBox">
                            <img src={image} alt="Image" width="200px"></img>
                        </div>
                        <input type="file" accept=".image/*" onChange={convertImage} />
                        <div id="nameBox">
                            <div id='nameTextBox'>{characterName}</div>
                        </div>
                    </div>
                    <div id="mainInfo">
                        <lable for="fullNameBox">Full Name: </lable>
                        <input type="text" id="fullNameBox" className='textStyle' value={fullName} placeholder="Full Name" onChange={(e) => setFullName(e.target.value)} onBlur={() => saveInfo(fullName, setFullName, "fullName")} />
                        <p></p>
                        <lable for="ageBox">Age: </lable>
                        <input type="text" id="ageBox" className='textStyle' value={age} placeholder="Age" onChange={(e) => setAge(e.target.value)} onBlur={() => saveInfo(age, setAge, "age")} />
                        <p></p>
                        <lable for="genderBox">Gender: </lable>
                        <input type="text" id="genderBox" className='textStyle' value={gender} placeholder="Gender" onChange={(e) => setGender(e.target.value)} onBlur={() => saveInfo(gender, setGender, "gender")} />
                        <p></p>
                        <lable for="heightBox">Height: </lable>
                        <input type="text" id="heightBox" className='textStyle' value={height} placeholder="Height" onChange={(e) => setHeight(e.target.value)} onBlur={() => saveInfo(height, setHeight, "height")} />
                        <p></p>
                        <lable for="birthdayBox">Birthday: </lable>
                        <input type="text" id="birthdayBox" className='textStyle' value={birthday} placeholder="Birthday" onChange={(e) => setBirthday(e.target.value)} onBlur={() => saveInfo(birthday, setBirthday, "birthday")} />
                        <p></p>
                        <lable for="speciesBox">Species: </lable>
                        <input type="text" id="speciesBox" className='textStyle' value={species} placeholder="Species" onChange={(e) => setSpecies(e.target.value)} onBlur={() => saveInfo(species, setSpecies, "species")} />
                        <p></p>
                        <p></p>
                        <div>Need help with a name? <input type='button' value='Generate Random Name' onClick={() => setPopupOpen(true)} ></input></div>
                    </div>
                </div>

                <div id="additionalInfo">
                    <Accordion>
                        <Accordion.Item eventKey='0'>
                            <Accordion.Header>Personality</Accordion.Header>
                            <Accordion.Body>
                                <div className="accordion-body">
                                    <label for="personalityBox"></label>
                                    <textarea id="personalityBox" className="textAreaInfo" value={personality} onChange={(e) => setPersonality(e.target.value)} onBlur={() => saveInfo(personality, setPersonality, "personality")}></textarea>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='1'>
                            <Accordion.Header>Strengths</Accordion.Header>
                            <Accordion.Body>
                                <div className="accordion-body">
                                    <label for="strengthsBox"></label>
                                    <textarea id="strengthsBox" className="textAreaInfo" value={strengths} onChange={(e) => setStrengths(e.target.value)} onBlur={() => saveInfo(strengths, setStrengths, "strengths")}></textarea>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='2'>
                            <Accordion.Header>Weaknesses</Accordion.Header>
                            <Accordion.Body>
                                <div className="accordion-body">
                                    <label for="weaknessesBox"></label>
                                    <textarea id="weaknessesBox" className="textAreaInfo" value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} onBlur={() => saveInfo(weaknesses, setWeaknesses, "weaknesses")}></textarea>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
            <p></p>

            <Popup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)}>
                <div id='fileHeaders'>Generate Random Name</div>
                <label><input type='radio' name='nameGender' value='male' checked={randomNameGender === 'male'} onChange={(e) => setRandomNameGender(e.target.value)}></input>Male</label>
                <div><label><input type='radio' name='nameGender' value='female' checked={randomNameGender === 'female'} onChange={(e) => setRandomNameGender(e.target.value)}></input>Female</label></div>
                <div><label><input type='radio' name='nameGender' value='any' checked={randomNameGender === 'any'} onChange={(e) => setRandomNameGender(e.target.value)}></input>Any</label></div>
                <p></p>
                <input type='button' value='Generate' onClick={generateName}></input>
            </Popup>
        </main>
    );
}