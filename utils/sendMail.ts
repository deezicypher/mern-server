import { Response } from "express";
import nodemailer from "nodemailer"

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

const sendEmail = async (to: string, url: string, txt: string, res:Response,email:string) => {

  try {
    const mailOptions = {
      from: SENDER_MAIL,
      to: to,
      subject: "F - Activate your account",
      html: `
              <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h3 style="font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 25px; color: #000000; width: 100%; text-align: center;">Welcome to F Asset Investment Company.</h2>
              <div style="width: 50px;  height: 3px; margin-top: 20px; border: none; background-color: #01d5a0;"></div>
              <p style="font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 14px; color: #000000; line-height: 30.8px; margin-bottom: 10px; width: 80%; line-height: 40.8px;">Congratulations! You're almost set to start using F.
                  Just click the button below to validate your email address.
              </p>
              
              <a href=${url} style="display: flex; justify-content: center; align-items: center; width: 100%; border-radius: 0.375rem; border: none; background-color: #01d5a0; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #FFFFFF; text-decoration: none; outline: none; transition: background-color 0.2s ease-in-out;">
              <span style="position: relative; display: flex; align-items: left; padding-right: 0.75rem;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 1.5rem; height: 1.5rem;">
                  <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 01-1.5 0V6.75a3.75 3.75 0 10-7.5 0v3a3 3 0 013 3v6.75a3 3 0 01-3 3H3.75a3 3 0 01-3-3v-6.75a3 3 0 013-3h9v-3c0-2.9 2.35-5.25 5.25-5.25z"></path>
                </svg>
              </span>
              ${txt}
            </a>
          
            <p style="font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 14px; color: #000000; line-height: 30.8px; margin-bottom: 10px; width: 80%; line-height: 40.8px; word-break: break-all;">If the button doesn't work for any reason, you can also click on the link below:</p>
          
            <div style="font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 14px; color: #000000; line-height: 30.8px; margin-bottom: 10px; width: 80%; line-height: 40.8px; word-break: break-all;">${url}</div>
            </div>
              </div>
            `,
    };

   transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
          console.log(err)
          return res.status(400).json({
              error: "Unable to proceed further at the moment, try again later"
          })
      }
      return res.json({
          msg: `Confirmation Email sent to ${email}`,
          email: email,
      })
  })

  } catch (err) {
    console.log(err);
  }
};

export const ResetPass = async (to: string, url: string, txt: string, res:Response,email:string) => {

  try {
    const mailOptions = {
      from: SENDER_MAIL,
      to: to,
      subject: "Password reset Link",
      html: `
              <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h3 style="font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 25px; color: #000000; width: 100%; text-align: center;">Password Reset Link</h3>

<div style="width: 50px;  height: 3px; margin-top: 20px; border: none; background-color: #01d5a0;"></div>

<p style="font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 14px; color: #000000; line-height: 30.8px; margin-bottom: 10px; width: 80%; line-height: 40.8px;">To reset your password click the link or button below</p>

              <a href=${url} style="display: flex; justify-content: center; align-items: center; width: 100%; border-radius: 0.375rem; border: none; background-color: #01d5a0; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #FFFFFF; text-decoration: none; outline: none; transition: background-color 0.2s ease-in-out;">
  <span style="position: relative; display: flex; align-items: left; padding-right: 0.75rem;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 1.5rem; height: 1.5rem;">
      <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 01-1.5 0V6.75a3.75 3.75 0 10-7.5 0v3a3 3 0 013 3v6.75a3 3 0 01-3 3H3.75a3 3 0 01-3-3v-6.75a3 3 0 013-3h9v-3c0-2.9 2.35-5.25 5.25-5.25z"></path>
    </svg>
  </span>
  ${txt}
</a>

          
<p style="font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 14px; color: #000000; line-height: 30.8px; margin-bottom: 10px; width: 80%; line-height: 40.8px; word-break: break-all;">If the button doesn't work for any reason, you can also click on the link below:</p>
          
              <div style="font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 14px; color: #000000; line-height: 30.8px; margin-bottom: 10px; width: 80%; line-height: 40.8px; word-break: break-all;">${url}</div>
              </div>
            `,
    };

   transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
          console.log(err)
          return res.status(400).json({
              error: "Unable to proceed further at the moment, try again later"
          })
      }
      return res.json({
          msg: `Password Reset Email sent to ${email}`,
          email: email,
      })
  })

  } catch (err) {
    console.log(err);
  }
};

export default sendEmail;
