const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API,
    },
  })
);

module.exports = (to, subject, content) => {
  transporter.sendMail({
    to: to,
    from: "prakashamtara07@gmail.com",
    subject: subject,
    html: content,
  });
};
