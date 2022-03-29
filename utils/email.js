//dependencies
const nodemailer = require('nodemailer');

//sending emails with nodemailer
const sendEmail = async options => {
  //1) Creating a transporter -> service that will send the email
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '35f8faf29004da',
      pass: 'dcfb31f78a2220'
    }
  });
  //2) Defining email options
  const mailOptions = {
    from: 'Cynthia Romero <cynthia@cynthia.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    //html:
  };
  //3) Actually sending the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
