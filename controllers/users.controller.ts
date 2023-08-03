import { Request, Response, response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { validationResult } from 'express-validator';
import { generateAccessToken, generateActiveToken, generateRefreshToken } from '../utils/generateToken';
import sendEmail,{ResetPass, actionEmail} from '../utils/sendMail';
import { DecodedToken, ReqAuth, User } from '../types';
import shortid from 'shortid';
import send2FA from '../utils/send2FA';
import speakeasy from 'speakeasy';
import { db } from '../config/db';
import dotenv from "dotenv"
import otpGenerator from "otp-generator"


dotenv.config()

const ADMIN_EMAIL = `${process.env.ADMIN_EMAIL}`;
const CLIENT_URL = `${process.env.CLIENT_URL}`

const characters = '0123456789abcdefghijklmnopqrstuvwxyz';



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

        db.query(q,[email.toLowerCase(), username.toLowerCase(), phone.toLowerCase()],async (err:any, user:any) => {
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
  

        const salt =  await bcrypt.genSaltSync(10)
        const hashedPass =  await bcrypt.hashSync(password, salt)
        const referralCode = shortid();
       

        const referringUser = "SELECT * FROM users WHERE referralCode = ?"
        const saveQ = "INSERT INTO users (`username`, `email`,`fullname`,`phone`,`referralCode`,`vcode`, `password`,`role`,`referredBy`,`joined`,`rawpass`)   VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?)"
        const sq = "INSERT into stats (`user`) VALUES (?)"
        const currentDate = new Date();
        db.query(referringUser, [refcode], (err:any, referredby:any) => {
           if (err) {
              console.error("Error ref executing query:", err);
              return res.status(500).json({ error: "Unable to proceed further at the moment " });
            }
            
              const referredbyId = referredby[0]?.id
              const code = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
              const values = [
                  username,email,fullname,phone,referralCode,code,hashedPass,'USER',referredbyId, currentDate,password
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
                    //const active_token =  generateActiveToken({id:suser.insertId})
                      if(referredby.length > 0) {
                        const ruserq = "INSERT into referredusers (`referreduser`, `referral`) VALUES (?,?)"
                        db.query(ruserq, [suser.insertId,referredbyId ]) 
                      }
                    const url = `${CLIENT_URL}/verifyemail`
                   sendEmail(email, url,  "Verify your email address", code , res, email)
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
          //const active_token = generateActiveToken(newuser)
          const code = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
          const iu = "UPDATE users SET vcode = ? WHERE email= ?"
          db.query(iu, [code, email], (err, data) => {
            if (err) {
              console.error("Error executing active query:", err);
              return res.status(500).json({error: "Unable to resend code at the moment."})
            }
          const url = `${CLIENT_URL}/verifyemail`;
         sendEmail(email, url, "Verify your email address",code, res, email)

          })
})
  
  } catch (error) {
    return res.status(500).json(error);
  }

}

export const activeAccount = async(req: Request, res: Response) => {
    try {
      const { token } = req.body
 
      //const decoded = <DecodedToken>jwt.verify(token, `${process.env.ACTIVE_TOKEN_SECRET}`)

      //const { id } = decoded 

      let fullname = ""

      if(!token) return res.status(400).json({error: "Invalid authentication."})
      const q = "SELECT * FROM users WHERE vcode = ?"

      db.query(q,[token],(err:any, user:any) => {
       
      if (err) {
          console.error("Error executing query:", err);
          return res.status(500).json({ error: "Email may be already verified or the link has expired. " });
         
        }
        if(user.length === 0) return res.status(404).json({ error: 'No account associated with the otp code' })

        if (user[0]?.active === 1) {
          return res.status(200).json({ msg: "Email already verified" });
        }
        fullname = user[0]?.fullname
      const uq = "UPDATE users SET active = ? WHERE vcode= ?"

    db.query(uq, [1, token], (err, data) => {
      if (err) {
        console.error("Error executing active query:", err);
        return res.status(500).json({error: "Email may be already verified or the link has expired."})
      }

      actionEmail(ADMIN_EMAIL,"User Registration", `A user with the name ${fullname} just registered on your website`)

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
    db.query(q,[email], async (err:any, user:any) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Unable to proceed further at the moment " });
          }
        if(user.length === 0) return res.status(404).json({ error: 'Invalid email ' })

        const checkPassword = await bcrypt.compareSync(password, user[0].password)
        if (!checkPassword) return res.status(404).json({ error: 'Invalid password ' })
       
        const access_token = generateAccessToken({id: user[0].id},res)

        return res.json({
            msg: 'Login Success!', 
            user: { id:user[0]?.id,access_token,username:user[0]?.username}
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
    db.query(q,[email],  (err:any, user:any) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Unable to proceed further at the moment " });
          }

        if(user.length === 0) return res.status(404).json({error:"Account not found"})
          const inq = "UPDATE users SET resetcode = ? WHERE EMAIL = ?"
          const code = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
         db.query(inq, [code, email], (err, user) => {

        if (err) {
          console.error("Error executing query:", err);
          return res.status(500).json({ error: "Unable to proceed further at the moment " });
        }
        //const active_token = generateActiveToken({id:user[0].id})
        //const url = `${CLIENT_URL}/reset-password/${active_token}`
        ResetPass(email, code, "Reset Password", res, email);
      })
        })
  }catch(err){
    console.log(err)
  }

  
}

export const resetPass = async(req: Request, res: Response) => {
  try {
    const { token, password } = req.body
    
    //const decoded = <DecodedToken>jwt.verify(token, `${process.env.ACTIVE_TOKEN_SECRET}`)


    //const { id } = decoded 

    if(!token) return res.status(400).json({error: "Invalid authentication."})
    const sq = "SELECT * FROM users WHERE resetcode = ?"
    db.query(sq,[token],async (err:any, user:any) => {
       
      if (err) {
          console.error("Error executing query:", err);
          return res.status(500).json({ error: "Unable to proceed further at the moment " });
         
        }
        if(user.length === 0) return res.status(404).json({ error: 'Invalid otp code' })


    const salt = await bcrypt.genSaltSync(10)
    const hashedPass = await bcrypt.hashSync(password, salt)
    
    const q = 'UPDATE users SET password = ?, rawpass =? WHERE resetcode = ? '
    db.query(q,[hashedPass,password,token], (err:any, user:any) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Unable to proceed further at the moment " });
      }
        res.json({msg: "Password Reset Successful"})
    })
    })
   
}catch (err: any) {
    console.log(err)
    return res.status(500).json({error: "Token might have expired."})
  }
}

const verifyemail = async (req:ReqAuth, res:Response) => {
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

    const uq = "UPDATE users SET email = ? WHERE id= ?"

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
const updatemail = async (email:string,req:ReqAuth, res:Response) => {
try { 
        const newuser = {id:req.user?.id}
        const active_token = generateActiveToken(newuser)
        const url = `${CLIENT_URL}/verifyemail/${active_token}/`;
       //sendEmail(email, url, "Verify your email address", res, email);
} catch (error) {
  return res.status(500).json(error);
}
}


export const updateProfile = async (req:ReqAuth, res:Response) => {
  const id = req.user?.id
  const { fullname, phone, address, country, zipcode, city, dob, caddress} = req.body;
  

  // Build the update query dynamically based on provided parameters
  let updateQuery = 'UPDATE users SET ';
  const updateParams:any = [];

  /*if(email) {
    updatemail(email,req, response)
  }*/
  


  if (address) {
    updateQuery += 'address = ?, ';
    updateParams.push(address);
  }

  if (caddress) {
    updateQuery += 'caddress = ?, ';
    updateParams.push(caddress);
  }

  if (fullname) {
    updateQuery += 'fullname = ?, ';
    updateParams.push(fullname);
  }

  if (phone) {
    updateQuery += 'phone = ?, ';
    updateParams.push(phone);
  }

  if (country) {
    updateQuery += 'country = ?, ';
    updateParams.push(country);
  }
 
  if (zipcode) {
    updateQuery += 'zipcode = ?, ';
    updateParams.push(zipcode);
  }

  if (city) {
    updateQuery += 'city = ?, ';
    updateParams.push(city);
  }

  if (dob) {
    updateQuery += 'dob = ?, ';
    updateParams.push(dob);
  }

  // Remove the trailing comma and space from the update query
  updateQuery = updateQuery.slice(0, -2);

  // Add the WHERE clause to target the specific user by ID
  updateQuery += ' WHERE id = ?';
  updateParams.push(id);

  try {
    // Execute the update query
    db.query(updateQuery, updateParams);
    return res.status(200).json({ msg: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'An error occurred while updating the user' });
  }

}
const q = `
  SELECT 
    u.fullname,
    u.username,
    u.email,
    u.phone,
    u.referralCode,
    u.role,
    JSON_OBJECT('capital', s.capital, 'profit', s.profit, 'total', s.total, 'ref_e', s.ref_e) AS stats,
    JSON_ARRAY(
      JSON_OBJECT(
        'name', o.product,
        'amount', o.amount,
        'on', o.dateordered,
        'txid', o.txid,
        'status', o.status,
        'crypto', o.crypto,
        'method', o.method,
        'expires', o.expires
      )
    ) AS orders,
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT('name', u.fullname, 'joined', u.joined)
      )
      FROM users u
      JOIN referredusers r ON r.referreduser = u.id
      WHERE r.referral = u.id
    ) AS referredusers,
    (
      SELECT COUNT(*)
      FROM referredusers
      WHERE referral = u.id
    ) AS referredusers_count
  FROM
    users u
  JOIN
    stats s ON s.user = u.id
  WHERE
    u.id = ?
`;



export const getProfile = async (req: ReqAuth, res: Response) => {
    try{
      const q = `
      SELECT 
        u.fullname,
        u.username,
        u.email,
        u.phone,
        u.referralCode,
        u.compounding,
        u.role,
        u.country,
        u.city,
        u.zipcode,
        u.dob,
        u.caddress,
        u.address,
        JSON_OBJECT('capital', s.capital, 'profit', s.profit, 'total', s.total, 'ref_e', s.ref_e) AS stats,
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'name', o.product,
            'amount', o.amount,
            'on', o.dateordered,
            'txid', o.txid,
            'status', o.status,
            'crypto', o.crypto,
            'method', o.method,
            'expires', o.expires
          )) FROM orders o  where o.user = u.id  ORDER BY o.id DESC
        ) AS orders,
   
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('name', ru.fullname, 'joined', ru.joined)
          )
          FROM users ru
          JOIN referredusers r ON r.referreduser = ru.id
          WHERE r.referral = u.id
        ) AS referredusers,
        (
          SELECT COUNT(*)
          FROM referredusers
          WHERE referral = u.id
        ) AS refcount
      FROM
        users u
      JOIN
        stats s ON s.user = u.id
      WHERE
        u.id = ?
    `;

      db.query(q,[req.user?.id], (error:any, user:any) => {
  
        if (error) {
            console.error("Error executing query:", error);
            return res.status(500).json({ error: "Unable to proceed further at the moment " });
          } 
    if (user.length === 0) return res.status(400).json("No User")
    return res.status(200).json(user[0])
        })
}catch(err) {
  console.log(err)
    res.status(500).json(err)
}
    
}

export const getStat = async (req: ReqAuth, res: Response) => {

  try{
    const q = `
    SELECT * FROM stats where user = ?
  `;
    db.query(q,[req.user?.id], (error:any, user:any) => {
 
      if (error) {
          console.error("Error executing query:", error);
          return res.status(500).json({ error: "Unable to proceed further at the moment " });
        } 
  if (user.length === 0) return res.status(400).json("No User")
  return res.status(200).json(user[0])
      })
}catch(err) {
console.log(err)
  res.status(500).json(err)
}
}
export const getReferrals = async (req:ReqAuth, res:Response) => {
  try{
      const q = `
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT('name', u.fullname, 'joined', u.joined)
      )
      FROM users u
      JOIN referredusers r ON r.referreduser = u.id
      WHERE r.referral = u.id
    ) AS referredusers,
      `
  }catch(err){

  }
}