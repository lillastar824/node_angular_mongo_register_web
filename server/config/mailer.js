const sgMail = require("@sendgrid/mail");
const templates = {
  verification_code: "d-e5bd7680eff149aabdb0a9e53e8d59af",
  final_confirmation_email: "d-e779dcfad7fb47e7be8d79bdfe75fb0c",//not used
  admin_user_joining_request: "d-41ffdfe248164ac696762c3884ff5d35",
  user_invite_email: "d-68c570dd120044d894e07566bf951964",//not used
  purchase_receipt: "d-8ddbc4346a0a49038af8055e5b25d967",
  purchase_receipt_withdiscount: "d-2e191caa6fd44794bac47d8c08b06b89",
  send_invite: "d-936910723146421a9a0ad6eac34e0409",//invite friend from modal box
  signup_invite: "d-3f5909b230384fe091b4699337f61e5a",
  standard_receipt: "d-65e8121a2fce4798b55ae1f104bd1798",
  thank_you: "d-f581ea6889c1495787b9fb863ac7b931",
  error_email: "d-e2aeb65a082f44c1929f154526a7f6f7",
  commission_approve:"d-421d1751c6f34c3f9403d35336d3560b",
  atsign_transfer:"d-140195dba59c4606aa95fa2f4ef8bc99",
  renewal_reminder_60:"d-649af3e63cdf423493a493633089365a",
  renewal_reminder_due:"d-be41dbba7938491788d28406672967d8",
  renewal_reminder_past30:"d-c00000a5207f4d5bb37e8c2f419a7b43",
  renewal_reminder_past60:"d-e0b63251eaa7493a96bb8383a2a46588",
  atsign_expired:"d-5373f037000044cbb662ddc81a0a0b23",
  renewal_receipt:"d-c8f92f6ba7b94c77b1cc639592fd2bdf",
  transfer_email:"d-1c688accbf7d4e86b4454becc374df2e",
  transfer_email_reminder:"d-8e3f909eaa7b4f868d5763305bdc65d9",
  transfer_reminder_30:"d-7386d4fb76654217aec4c15ef41314ce",
  transfer_reminder_1:"d-82bb3d5f63eb45d6a6edca9733f84e79",
  transfer_accepted:"d-d6122cd535a04ee6a80b20263d16115a",
  transfer_rejected:"d-5f5ea1f1a4c244178cc97f64e74f2e38",
  cron_status:"d-4a12f933c48649679afb2f14bc9b193a",
  transfer_receipt:"d-92783d6bdafd41e9a36e2305f619da8c",
  transfer_cancelledbyowner_emailto_recipient:"d-c5c4b1e6831a4d9c895114fad405d799",
  transfer_expired_recipient:"d-63db3f23d3c64b4986101583ad6bc405",
  transfer_expired_owner:"d-789630645c144583a118359d75f9be14",
  early_access_signup_success:"d-a161ca425d5e412a82d11be4bb4837f8",
};
const unsubscribeGroups = {
  verification_code: 0,
  final_confirmation_email: 90803,
  admin_user_joining_request: 90803,
  user_invite_email: 90803,
  purchase_receipt: 90813,
  purchase_receipt_withdiscount: 90813,
  send_invite: 90803,
  signup_invite: 90803,
  standard_receipt: 90803,
  thank_you: 90803,
  atsign_transfer: 90803,
  renewal_reminder_60:90803,
  renewal_reminder_due:90803,
  renewal_reminder_past30:90803,
  renewal_reminder_past60:90803,
  atsign_expired:90803,
  renewal_receipt: 90803,
  transfer_email:90803,
  transfer_email_reminder:90803,
  transfer_reminder_30:90803,
  transfer_reminder_1:90803,
  transfer_accepted:90803,
  transfer_rejected:90803,
  transfer_receipt:90803,
  transfer_cancelledbyowner_emailto_recipient:90803,
  transfer_expired_recipient:90803,
  transfer_expired_owner:90803,
  early_access_signup_success:90803,
  error_email: 0,
  cron_status: 0,
};
const fromEmail = {
  verification_code: { email: 'verification@atsign.com' },
  admin_user_joining_request: { email: 'info@atsign.com' },
  user_invite_email: { email: 'info@atsign.com' },
  purchase_receipt: { email: 'receipt@atsign.com' },
  purchase_receipt_withdiscount: { email: 'receipt@atsign.com' },
  send_invite: { email: 'invitation@atsign.com' },
  signup_invite:  { email: 'invitation@atsign.com' },
  standard_receipt: { email: 'receipt@atsign.com' },
  thank_you: { email: 'info@atsign.com' },
  error_email: { email: 'info@atsign.com' },
  commission_approve: { email: 'info@atsign.com' },
  atsign_transfer: { email: 'info@atsign.com' },
  renewal_reminder_60: { email: 'info@atsign.com' },
  renewal_reminder_due: { email: 'info@atsign.com' },
  renewal_reminder_past30: { email: 'info@atsign.com' },
  renewal_reminder_past60: { email: 'info@atsign.com' },
  atsign_expired: { email: 'info@atsign.com' },
  renewal_reminder: { email: 'info@atsign.com' },
  renewal_receipt: { email: 'receipt@atsign.com' },
  transfer_receipt: { email: 'receipt@atsign.com' },
  transfer_email:{ email: 'info@atsign.com' },
  transfer_email_reminder:{ email: 'info@atsign.com' },
  transfer_reminder_30:{ email: 'info@atsign.com' },
  transfer_reminder_1:{ email: 'info@atsign.com' },
  transfer_accepted:{ email: 'info@atsign.com' },
  transfer_rejected:{ email: 'info@atsign.com' },
  cron_status:{ email: 'info@atsign.com' },
  transfer_cancelledbyowner_emailto_recipient:{ email: 'info@atsign.com' },
  transfer_expired_recipient:{ email: 'info@atsign.com' },
  transfer_expired_owner:{ email: 'info@atsign.com' },
  early_access_signup_success:{ email: 'internetoptimist@atsign.com' },
};
// const nodemailer = require('nodemailer');
async function sendMail(mailData) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: mailData['to'],
    from: { email: process.env.MAIL_USERNAME, name: process.env.MAIL_FROMNAME },
    subject: mailData['subject'],
    html: mailData['html'],
  };
  console.log(msg)
  // sgMail.send(msg, (error, result) => {

  //   if (error) {
  //       console.log(error);
  //   } else {
  //       console.log("That's wassup!");
  //   }
  // });
  //   let transporter = nodemailer.createTransport({
  //   host: process.env.MAIL_HOST,
  //   service : "gmail",
  //   port: process.env.MAIL_PORT,
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //       user: process.env.MAIL_USERNAME,
  //       pass: process.env.MAIL_PASSWORD
  //   }
  // });

  // // send mail with defined transport object
  // let info = await transporter.sendMail({
  //   from: process.env.MAIL_FROMNAME + '<' + process.env.MAIL_USERNAME + '>', // sender address
  //   to: mailData['to'], // list of receivers
  //   subject: mailData['subject'], // Subject line
  //   html: mailData['html'] // html body
  // });
  // console.log(mailData);
  // console.log("Message sent: %s", info.messageId);
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
module.exports = sendMail;
module.exports.sendEmailSendGrid = function (data) {
  data.dynamicdata['environment'] = process.env.SENDGRID_SUBJECT_ENV || '';
  let msg = {
    to: data.receiver,
    from: { email: data.from_email || fromEmail[data.templateName]['email'] || process.env.MAIL_USERNAME, name: data.from_name || '@sign' },
    // reply_to: process.env.MAIL_USERNAME,
    templateId: templates[data.templateName],
    dynamic_template_data: data.dynamicdata
  };
  if (unsubscribeGroups[data.templateName]) {
    msg['asm'] = { group_id: unsubscribeGroups[data.templateName] };
  }
  if (data.cc_email) {
    msg.cc = data.cc_email
  }

  if (process.env.EMAIL_ACTIVE == 1) {

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    sgMail.send(msg, (error, result) => {
      // console.log(error, result)
      if (error) {
        console.log(error);
      } else {
        console.log("That's wassup!");
      }
    });
  }
  else {
    console.log(msg);
  }

}