const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
 const transport = nodemailer.createTransport({
   host: 'sandbox.smtp.mailtrap.io',
   port: 2525,
   auth: {
     user: 'f6cf5244e4aea8',
     pass: 'ae25c3be5a51bd',
   },
 });
 const emailOptions = {
   from: 'wEYRi@example.com',
   to: options.email,
   subject: options.subject,
   text: options.message,
   html: `<h1>${options.message}</h1>`,
 };
 try {
   await transport.sendMail(emailOptions);

 } catch (err) {
  throw new Error('there was an error sending the email. Try again later' , err);
 }

};

module.exports = sendEmail;

