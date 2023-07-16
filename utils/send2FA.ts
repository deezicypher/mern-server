import { Response } from "express";
import nodemailer from "nodemailer"
import speakeasy from 'speakeasy';

const SENDER_MAIL = `${process.env.SENDER_EMAIL_ADDRESS}`;

var transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "6a6f8743419ece",
        pass: "5df3da7b6ec035"
    }
});



  
// send mail

const send2FA = async (email: string, secret:string, res:Response) => {
    const code = speakeasy.totp({
      secret: secret?secret:secret,
      encoding: 'ascii',
      });
       

  try {
    const mailOptions = {
      from: SENDER_MAIL,
      to: email,
      subject: "F - Two-Factor Authentication",
      html: `
              <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h2 style="text-align: center; text-transform: uppercase;color: teal;">Two-Factor Authentication</h2>
              <p>Please use the following code to complete your login:
              </p>
              
              
          
              <p>${code}</p>
          
   
              </div>
            `,
    };

   transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
         
          return res.status(400).json({
              error: "Unable to proceed further at the moment, try again later"
          })
      }
      return res.json({
          msg: `2FA email sent to ${email}`,
          twofa: true,
          email: email,
      })
  })

  } catch (err) {
    console.log(err);
  }
};

export default send2FA;
