const sgMail = require("@sendgrid/mail");
require('dotenv').config();
console.log(process.env.SENDGRID_API_KEY)
sgMail.setApiKey('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');
var templates = {
    verification_code: "d-26af987811d9497e9dbcd65eb5df95fb",
    final_confirmation_email        : "d-e779dcfad7fb47e7be8d79bdfe75fb0c",
    admin_user_joining_request       : "d-68c570dd120044d894e07566bf951964",
    user_invite_email       : "d-68c570dd120044d894e07566bf951964",
};
function sendEmail(data) {
    const msg = {
       to: data.receiver,
       from: {email:process.env.MAIL_USERNAME, name:process.env.MAIL_FROMNAME},
       templateId: templates[data.templateName],
       dynamic_template_data: {
          name: data.name,
          verification_code:  data.verification_code,
          reset_password_url: data.reset_password_url
       }
    };
    //sgMail.setApiKey('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');
    sgMail.setApiKey('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');
//     msg = {
//   to: 'ashishkhanna.dev@gmail.com',
//   from: "ashishkhanna.dev@gmail.com",
  
//   subject: 'Sending with Twilio SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// };
    sgMail.send(msg, (error, result) => {
       if (error) {
           console.log(error);
       } else {
           console.log("That's wassup!");
       }
    });
 }
 var data = {
    //name of the email template that we will be using
    templateName: "verification_code",
    //sender's and receiver's email
    sender: "ashishkhanna.dev@gmail.com",
    receiver: "khannawise@gmail.com",   
    //name of the user
    verification_code: "Arjun Bastola",
    //unique url for the user to confirm the account
    confirm_account_url: "www.veniqa.com/unique_url"
    
 };
 //pass the data object to send the email
 sendEmail(data);