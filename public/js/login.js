/* eslint-disable */

//login functionality with axios
const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    console.log(res);
  } catch (error) {
    console.log(error.response.data);
  }
};

//adding functionality to our login form
document.querySelector('.form').addEventListener('submit', e => {
  //preventing form from being sent before executing the rest of the code of this function
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
