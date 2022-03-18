//dependencies
const dotenv = require('dotenv');
//reading the env variables from our config.env file and saving them into Node environment variables
dotenv.config({ path: './config.env' });

const app = require('./app');

//establishing the port
const port = process.env.PORT || 3000;

//CREATING SERVER
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
