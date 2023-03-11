const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // SENDGRID api key...

/**
 *
 * @param {string} email // this is the recipient's email
 * @param {string} templateId this is the template id
 * @param {string} subject email subject
 * @param {object} data this is the object data for the template
 */
const sendGridEmail = (email, templateId, subject, data) => {
  const mail = {
    to: email, // recipient's email address
    from: process.env.SENDGRID_EMAIL_FROM, // edike email address...
    subject: subject,
    templateId: templateId, // sendgrid template id...
    dynamicTemplateData: data, // this is the json object that needs to be sent to for the template to work...
  };

  sgMail
    .send(mail)
    .then(() => console.log("Email sent successfully")) // handle success how you want to...
    .catch((error) => console.error(error.toString())); // handle failure how you want to...
};

module.exports = { sendGridEmail };
