//dependencies
const app = require('./app');
//establishing the port
const port = 3000;

//CREATING SERVER
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
