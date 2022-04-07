//dependencies
const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Cynthia Romero <${process.env.EMAIL_FROM}>`;
  }

  //CREATING A TRANSPORTER -> service that will send the email
  newTransport() {
    //Production transporter
    if (process.env.NODE_ENV === 'production') {
      //SendGrid service
      return 1;
    }

    //Development transporter -> using sandbox email in nodemailer
    return nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '35f8faf29004da',
        pass: 'dcfb31f78a2220'
      }
    });
  }

  //ACTUALLY SENDING EMAILS
  async send(template, subject) {
    //1) Rendering HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    //2) Defining email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html)
    };

    //3) Creating a transport and sending email
    await this.newTransport().sendMail(mailOptions);
  }

  //WELCOME EMAILS - Sending welcome email for new users
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Cyntours Family!');
  }
};
