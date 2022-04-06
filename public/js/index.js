/* eslint-disable */

//dependencies
import 'regenerator-runtime/runtime';
import { displayMap } from './leaflet';
import { login, logout } from './login';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');

if (mapBox) {
  //adding a map to each tour page
  const locations = JSON.parse(mapBox.dataset.locations); //reading the locations from the dataset property
  displayMap(locations);
}

//adding functionality to our login form
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    //preventing form from being sent before executing the rest of the code of this function
    e.preventDefault();
    login(email, password);
  });
}

//adding functionality to our logout button
if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}
