const nodeMailer = require('nodemailer');

const sendEmail = async (option) => {
  // 1) Create a transporter
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // activate in gmail "less secure app" option
  });
  // 2) define the email options

  const mailOptions = {
    from: 'hanzla zahid <hanzla@.io>',
    to: option.email,
    subject: option.subject,
    text: option.message,
    // html :
  };
  // 3) actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
