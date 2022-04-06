/* eslint-disable */

//dependencies
import 'regenerator-runtime/runtime';
import { displayMap } from './leaflet';
import { login } from './login';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');

if (mapBox) {
  //adding a map to each tour page
  const locations = JSON.parse(mapBox.dataset.locations); //reading the locations from the dataset property
  displayMap(locations);
}

if (loginForm) {
  //adding functionality to our login form
  loginForm.addEventListener('submit', e => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    //preventing form from being sent before executing the rest of the code of this function
    e.preventDefault();
    login(email, password);
  });
}
