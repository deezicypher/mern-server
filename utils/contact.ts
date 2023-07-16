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

const adminmail = "larrymoore@gmail.com"

// send mail

const ContactEmail = async (from: string,body:string,name:string,phone:string,res:Response) => {

  try {
    const mailOptions = {
      from: SENDER_MAIL,
      to: adminmail,
      subject: ` Message from ${name} `,
      html: `
              <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
          
              <p>from ${from} with ${phone}
              </p>
              <p>${body}</p>
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
          msg: `Message Received`,
      })
  })

  } catch (err) {
    console.log(err);
  }
};

export default ContactEmail;
