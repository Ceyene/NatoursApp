/* eslint-disable */

//dependencies
import axios from 'axios';
import { showAlert } from './alerts';

//login functionality with axios
export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm
      }
    });

    console.log(name, email, password, passwordConfirm);
    // if (res.data.status === 'success') {
    //   showAlert('success', 'User created successfully');
    //   window.setTimeout(() => {
    //     location.assign('/');
    //   }, 1000);
    // }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
