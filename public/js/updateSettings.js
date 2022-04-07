/* eslint-disable */

//dependencies
import axios from 'axios';
import { showAlert } from './alerts';

//making a call to the API from the client side to update user data
//update functionality with axios
export const updateSettings = async (data, type) => {
  try {
    //create url according to which type of data we are trying to update
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `User ${type} updated successfully`);
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
