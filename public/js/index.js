/* eslint-disable */

//dependencies
import 'regenerator-runtime/runtime';
import { displayMap } from './leaflet';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

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

//adding functionality to our user data form
if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    //preventing form from being sent before executing the rest of the code of this function
    e.preventDefault();

    //programatically recreating a multipart/form-data
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}

//adding functionality to our user password form
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    //preventing form from being sent before executing the rest of the code of this function
    e.preventDefault();

    //changing button value -> updating message for user while API is working and encrypting password
    document.querySelector('.btn--save-password').textContent = 'Updating...'; //

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    //waiting until the update is finished before continue
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    //once finished: changing button back to its original value
    document.querySelector('.btn--save-password').textContent = 'Save password';

    //clearing inputs after sending form
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
