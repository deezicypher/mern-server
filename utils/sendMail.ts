import { Response } from "express";
import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()


const SENDER_MAIL = `${process.env.SENDER_EMAIL_ADDRESS}`;
const ADMIN_EMAIL = `${process.env.ADMIN_EMAIL}`;

var transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "6a6f8743419ece",
        pass: "5df3da7b6ec035"
    }
});


// send mail

const sendEmail = async (to: string, url: string, txt: string,code:any, res:Response,email:string) => {

  try {
    const mailOptions = {
      from: SENDER_MAIL,
      to: to,
      subject: "F - Activate your account",
      html: `
              <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h3 style="font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 25px; color: #000000; width: 100%; text-align: center;">Welcome to F Asset Investment Company.</h2>
              <div style="width: 50px;  height: 3px; margin-top: 20px; border: none; background-color: #1890ff;"></div>
              <p style="font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 14px; color: #000000; line-height: 30.8px; margin-bottom: 10px; width: 80%; line-height: 40.8px;">Congratulations! You're almost set to start using F.
                  Just copy the OTP code below 
              </p>
              
              
            <h3 style="font-family: 'Poppins', sans-serif; font-weight: 900; color: #000000; line-height: 30.8px; margin-bottom: 10px; width: 80%; line-height: 40.8px; word-break: break-all;">${code}</h3>
           
  
           
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

export const actionEmail = async (to: string, subject:string, txt: string,) => {

  try {
    const mailOptions = {
      from: ADMIN_EMAIL,
      to: to,
      subject: `${subject}`,
      html: `
              <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h3 style="font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 25px; color: #000000; width: 100%; text-align: center;">${subject}</h2>
              <div style="width: 50px;  height: 3px; margin-top: 20px; border: none; background-color: #1890ff;"></div>
              <p style="font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 14px; color: #000000; line-height: 30.8px; margin-bottom: 10px; width: 80%; line-height: 40.8px;">
             ${txt}
              </p>
              
    
        
          
        </div>
              </div>
            `,
    };

   transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
          console.log(err)
          
      }
      
     

  })

  } catch (err) {
    console.log(err);
  }
};
export const ResetPass = async (to: string, code: any, txt: string, res:Response,email:string) => {

  try {
    const mailOptions = {
      from: SENDER_MAIL,
      to: to,
      subject: "Password reset Code",
      html: `
              <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h3 style="font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 25px; color: #000000; width: 100%; text-align: center;">Password Reset Code</h3>

<div style="width: 50px;  height: 3px; margin-top: 20px; border: none; background-color: #1890ff;"></div>

<p style="font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 14px; color: #000000; line-height: 30.8px; margin-bottom: 10px; width: 80%; line-height: 40.8px;"> Below is your password reset OTP code</p>
           
<h3 style="font-family: 'Poppins', sans-serif; font-weight: 900; color: #000000; line-height: 30.8px; margin-bottom: 10px; width: 80%; line-height: 40.8px; word-break: break-all;">${code}</h3>
           
            
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
