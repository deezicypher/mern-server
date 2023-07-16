import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { validationResult } from 'express-validator';
import { generateAccessToken, generateActiveToken, generateRefreshToken } from '../utils/generateToken';
import sendEmail,{ResetPass} from '../utils/sendMail';
import { DecodedToken, ReqAuth, User } from '../types';
import shortid from 'shortid';
import send2FA from '../utils/send2FA';
import speakeasy from 'speakeasy';
import { db } from '../config/db';
import dotenv from "dotenv"
dotenv.config()


const CLIENT_URL = `${process.env.CLIENT_URL}`


export const register = async (req: Request, res: Response) => {
    const {username, email,fullname,phone,refcode,password} = req.body;
    const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      error: firstError
    });
  } 

  
    try {

        const q =  "SELECT * FROM users WHERE email = ? or username = ? or phone = ?"

        db.query(q,[email.toLowerCase(), username.toLowerCase(), phone.toLowerCase()],(err:any, user:any) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({ error: "Unable to proceed further at the moment " });
              }
            if (user.length > 0) {
                if (user[0].email === email) {
                  return res.status(400).json({ error: "Email already exists" });
                }
                if (user[0].username === username) {
                  return res.status(400).json({ error: "Username already exists" });
                }
                if (user[0].phone === phone) {
                  return res.status(400).json({ error: "Phone number already exists" });
                }
              }
  

        const salt = bcrypt.genSaltSync(10)
        const hashedPass = bcrypt.hashSync(password, salt)
        const referralCode = shortid();
       

        const referringUser = "SELECT * FROM users WHERE referralCode = ?"
        const saveQ = "INSERT INTO users (`username`, `email`,`fullname`,`phone`,`referralCode`,`password`,`role`,`referredBy`)   VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        const sq = "INSERT into stats (`user`) VALUES (?)"
 
        db.query(referringUser, [refcode], (err:any, referredby:any) => {
           if (err) {
              console.error("Error ref executing query:", err);
              return res.status(500).json({ error: "Unable to proceed further at the moment " });
            }
              const referredbyId = referredby[0]?.id
              const values = [
                  username,email,fullname,phone,referralCode,hashedPass,'USER',referredbyId
              ]
              db.query(saveQ, values, (err:any, suser:any) => {
         
               if (err) { 
              console.error("Error executing save user query:", err);
              return res.status(500).json({ error: "Unable to proceed further at the moment " });
            }
                  db.query(sq,[suser.insertId], (err:any, data:any) => {
                    if (err) {
                      console.error("Error executing query:", err);
                      return res.status(500).json({ error: "Unable to proceed further at the moment " });
                    }
                    const active_token =  generateActiveToken({id:suser.insertId})

                    const url = `${CLIENT_URL}/verifyemail/${active_token}/`
                   sendEmail(email, url,  "Verify your email address", res, email)
                  })
              })
            })

    })

    }catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
} 

export const resendEmail = async (req:Request, res:Response) => {
  const {email} = req.body;

    const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      error: firstError,
    });
  }


  try {
    const q = "SELECT * FROM users WHERE email = ?"

        db.query(q,[email],(err:any, user:any) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Unable to send mail at the moment " });
          }
          if(user.length === 0) return res.status(404).json({ message: 'Account not found ' })
          if (user[0]?.active === 1) {
            return res.status(200).json({ msg: "Email already verified" });
          }
          const newuser = {id:user[0]?.id}
          const active_token = generateActiveToken(newuser)
          const url = `${CLIENT_URL}/verifyemail/${active_token}/`;
         sendEmail(email, url, "Verify your email address", res, email);
})
  
  } catch (error) {
    return res.status(500).json(error);
  }

}

export const activeAccount = async(req: Request, res: Response) => {
    try {
      const { token } = req.body
 
      const decoded = <DecodedToken>jwt.verify(token, `${process.env.ACTIVE_TOKEN_SECRET}`)

      const { id } = decoded 


      if(!id) return res.status(400).json({error: "Invalid authentication."})
      const q = "SELECT * FROM users WHERE id = ?"

      db.query(q,[id],(err:any, user:any) => {
       
      if (err) {
          console.error("Error executing query:", err);
          return res.status(500).json({ error: "Email may be already verified or the link has expired. " });
         
        }
        if(user.length === 0) return res.status(404).json({ error: 'Account not found ' })

        if (user[0]?.active === 1) {
          return res.status(200).json({ msg: "Email already verified" });
        }

      const uq = "UPDATE users SET active = ? WHERE id= ?"

    db.query(uq, [1, id], (err, data) => {
      if (err) {
        console.error("Error executing active query:", err);
        return res.status(500).json({error: "Email may be already verified or the link has expired."})
      }
      return res.json({msg: "Account Activated"})
    })
  })

     
 }catch (err: any) {
     
      return res.status(500).json({error: "Email may be already verified or the link has expired."})
     
    }
  }



export const enable2fa = async (req:Request, res:Response) => {
    const {id} = req.params;
    try{
    const secret = speakeasy.generateSecret();
    const secretKey = secret.base32;
    const q = 'UPDATE users SET secretkey = ? WHERE id = ? '
    db.query(q,[secretKey,id], (err:any, user:any) => {
        if(err) return console.log(err)
        return res.json({msg:"Two factor authentication activated "})
    })

}catch(err) {
    console.log(err)
}
}


export const verifyotp = async (req:Request, res:Response) => {
    const { secret, code, id } = req.body;

    const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: code,
        window: 6, 
      });


  if (verified) {
    const q = "SELECT * FROM users WHERE id = ?"
    db.query(q,[id], (err:any, user:any) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Unable to proceed further at the moment " });
          }
        const access_token = generateAccessToken({id},res)
        res.json({ msg: '2FA verification successful', user: { ...user[0], password: '' },access_token });
    })

  } else {
    // Code is invalid, deny access
    res.status(401).json({ error: 'Invalid 2FA code' });
  }
}

export const login = async (req: Request, res: Response) => {
    const {email, password} = req.body
    try{

    const q = "SELECT * FROM users WHERE email = ?"
    db.query(q,[email], (err:any, user:any) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Unable to proceed further at the moment " });
          }
        if(user.length === 0) return res.status(404).json({ error: 'Invalid email ' })

        const checkPassword = bcrypt.compareSync(password, user.password)
        if (!checkPassword) return res.status(404).json({ error: 'Invalid password ' })
       
        if(user.twoFA === true && user.secretkey !== null) return  send2FA(email,user?.secretkey, res)
        const access_token = generateAccessToken({id: user.id},res)

        res.json({
            msg: 'Login Success!', 
            user: { ...user[0], password: '',access_token }
            })
    })
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}






export const forgetPassword = async (req:Request, res:Response) => {
      const {email} = req.body

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const firstError = errors.array().map((error) => error.msg)[0];
      return res.status(422).json({
        error: firstError,
      });
    }


  try {
    const q = "SELECT * FROM users WHERE email = ?"
    db.query(q,[email], (err:any, user:any) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Unable to proceed further at the moment " });
          }

        if(user.length === 0) return res.status(404).json({error:"Account not found"})

    const active_token = generateActiveToken({id:user[0].id})

    const url = `${CLIENT_URL}/reset-password/${active_token}`
    
    ResetPass(email, url, "Reset Password", res, email);
        })
  }catch(err){
    console.log(err)
  }

  
}

export const resetPass = async(req: Request, res: Response) => {
  try {
    const { token, password } = req.body
    
    const decoded = <DecodedToken>jwt.verify(token, `${process.env.ACTIVE_TOKEN_SECRET}`)


    const { id } = decoded 

    if(!id) return res.status(400).json({error: "Invalid authentication."})

    const salt = bcrypt.genSaltSync(10)
    const hashedPass = bcrypt.hashSync(password, salt)
    
    const q = 'UPDATE users SET password = ? WHERE id = ? '
    db.query(q,[hashedPass,id], (err:any, user:any) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Unable to proceed further at the moment " });
      }
        res.json({msg: "Password Reset Successful", user:user[0]})
    })
  
   
}catch (err: any) {
    console.log(err)
    return res.status(500).json({error: "Token might have expired."})
   
  }
}



export const getProfile = async (req: ReqAuth, res: Response) => {
    try{
      const q = "SELECT   `fullname`,`username`,`email`, `phone`, `referralCode`, `role`, `s.capital`,`s.profit`,`s.total`, o.* , r.*   FROM users u  JOIN stats s ON s.user = u.id JOIN orders o ON o.user = u.id JOIN referredusers r  ON r.referral = u.id WHERE u.id = ?   "
    
      db.query(q,[req.user?.id], (error:any, user:any) => {
        if (error) {
            console.error("Error executing query:", error);
            return res.status(500).json({ error: "Unable to proceed further at the moment " });
          } 
    if (!user) return res.status(400).json("No User")
    return res.status(200).json(user)
        })
}catch(err) {
    res.status(500).json(err)
}
    
}

