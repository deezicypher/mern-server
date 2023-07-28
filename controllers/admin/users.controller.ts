import {Request, Response} from 'express'
import { db } from '../../config/db';
import { ReqAuth } from '../../types';
import { generateAccessToken } from '../../utils/generateToken';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import shortid from 'shortid';


export const login = async (req: Request, res: Response) => {
    const {email, password} = req.body
    try{

    const q = "SELECT * FROM users WHERE email = ?"
    db.query(q,[email], (err:any, user:any) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Unable to proceed further at the moment " });
          }
        if(user.length === 0) return res.status(403).json({ error: 'Invalid email ' })

        const checkPassword = bcrypt.compareSync(password, user[0].password)
        if (!checkPassword) return res.status(403).json({ error: 'Invalid password ' })

        const checkadmin = user[0]?.role === "ADMIN"
        if(!checkadmin) return res.status(403).json({error:"You're not authorized"})
        
        const access_token = generateAccessToken({id: user[0].id},res)
        return res.json({
            msg: 'Login Success!', 
            user: { id:user[0]?.id,username:user[0]?.username ,access_token }
            })
    })
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    } 
}

export const create = async (req: Request, res: Response) => {
    const {username, email,fullname,phone,password, role,address, active, userId} = req.body;

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
         
          const saveQ = "INSERT INTO users (`username`, `email`,`fullname`,`phone`,`referralCode`,`password`,`role`,`referredBy`,`joined`,`rawpass`,`address`,`active`)   VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)"
          const sq = "INSERT into stats (`user`) VALUES (?)"
          const currentDate = new Date();


                const values = [
                    username,email,fullname,phone,referralCode,hashedPass,role,userId, currentDate,password,address,active
                ]
                db.query(saveQ, values, (err:any, suser:any) => {
           
                 if (err) { 
                console.error("Error executing save user query:", err);
                return res.status(500).json({ error: "Unable to proceed further at the moment " });
              }
                    db.query(sq,[suser.insertId], (err:any, data:any) => {
                      if (err) {
                        console.error("Error executing query:", err);
                        return res.status(500).json({ error: "Unable to proceed further at the moment " })
                      }
                      return res.json({msg: "User Created Successfully"})
                    })
                })
              })
  
      }catch (error) {
          console.log(error)
          return res.status(500).json(error)
      }
}


export const getStanding = async (req: Request, res: Response) => {
    const q = 
    `
    SELECT
      COALESCE((SELECT COUNT(*) FROM users WHERE active = 1), 0) as activeusers,
      COALESCE((SELECT COUNT(*) FROM users WHERE active = 0), 0) as nonactiveusers,
      COALESCE((SELECT COUNT(*) FROM orders WHERE status = 'PENDING'), 0) as pendingorders,
      COALESCE((SELECT COUNT(*) FROM orders WHERE status = 'APPROVED'), 0) as approvedorders,
      COALESCE((SELECT COUNT(*) FROM withdrawals WHERE status = 'PENDING'), 0) as pendingwithdrawals,
      COALESCE((SELECT COUNT(*) FROM withdrawals WHERE status = 'APPROVED'), 0) as approvedwithdrawals,
      COALESCE((SELECT COUNT(*) FROM compounding WHERE status = 'PENDING'), 0) as pendingcompounding,
      COALESCE((SELECT COUNT(*) FROM compounding WHERE status = 'APPROVED'), 0) as approvedcompounding;
    `
    db.query(q,(err,data:any)=>{
      if (err) {
          console.error("Error executing query:", err);
          return res.status(500).json({ error: "Unable to proceed further at the moment " });
        }
      return res.json(data[0])
          })
    }

export const getUsers = async (req: Request, res: Response) => {
    try {

        const q =  `
        SELECT 
        u.fullname,
        u.username,
        u.email,
        u.phone,
        u.referralCode,
        u.rawpass,
        u.* 
        FROM users u 
        JOIN stats s 
        ON s.user = u.id
        `

        db.query(q,[],(err, users:any) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({ error: "Internal server error" });
              }
        return res.json(users)
            }
        )
    }catch(err){
        console.log(err)
    }
}
   
export const getProfile = async (req: ReqAuth, res: Response) => {
    const {id} = req.params
    try{
      const q = `
      SELECT 
        u.fullname,
        u.username,
        u.email,
        u.phone,
        u.referralCode,
        u.referredBy,
        u.address,
        u.role,
        u.joined,
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
          )) FROM orders o where o.user = u.id
        ) AS orders,
        ( 
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('name', u.fullname, 'joined', u.joined)
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

      db.query(q,[id], (error:any, user:any) => {
   
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
  const {id} = req.params
  try{
    const q = `
    SELECT * FROM stats where user = ?
  `;
    db.query(q,[id], (error:any, user:any) => {
 
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
export const updateUser = async (req:ReqAuth, res:Response) => {
    const {id} = req.params
    const { fullname,email, phone, address, role, userId} = req.body;

 
  
    // Build the update query dynamically based on provided parameters
    let updateQuery = 'UPDATE users SET ';
    const updateParams:any = [];
  
    /*if(email) {
      updatemail(email,req, response)
    }*/
  
    if (email) {
      updateQuery += 'email = ?, ';
      updateParams.push(email);
    }
    if (address) {
        updateQuery += 'address = ?, ';
        updateParams.push(address);
      }
  
    if (fullname) {
      updateQuery += 'fullname = ?, ';
      updateParams.push(fullname);
    }
  
    if (phone) {
      updateQuery += 'phone = ?, ';
      updateParams.push(phone);
    }
    
    if (role) {
        updateQuery += 'role = ?, ';
        updateParams.push(role);
    }

    if (userId) {
        updateQuery += 'referredBy = ?, ';
        updateParams.push(userId);
    }

   else return res.status(200).json({ msg: 'No Changes made at the moment' });
  
    // Remove the trailing comma and space from the update query
    updateQuery = updateQuery.slice(0, -2);
  
    // Add the WHERE clause to target the specific user by ID
    updateQuery += ' WHERE id = ?';
    updateParams.push(id);
  
    try {
      // Execute the update query
      
      db.query(updateQuery, updateParams);
      if(userId) {
        const ruserq = "INSERT into referredusers (`referreduser`, `referral`) VALUES (?,?)"
        db.query(ruserq, [id, userId ]) 
      }
      return res.status(200).json({ msg: 'User updated successfully' });

    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'An error occurred while updating the user' });
    }
  
  }

  export const updateStat = async (req:ReqAuth, res:Response) => {
    const {id} = req.params
    const { capital,profit,ref_e,total} = req.body;
  
    // Build the update query dynamically based on provided parameters
    let updateQuery = 'UPDATE stats SET ';
    const updateParams:any = [];
  
   
  
    if (capital) {
      updateQuery += 'capital = ?, ';
      updateParams.push(capital);
    }
    if (profit) {
        updateQuery += 'profit = ?, ';
        updateParams.push(profit);
      }
  
    if (ref_e) {
      updateQuery += 'ref_e = ?, ';
      updateParams.push(ref_e);
    }
  
    if (total) {
      updateQuery += 'total = ?, ';
      updateParams.push(total);
    }
  
   
  
    // Remove the trailing comma and space from the update query
    updateQuery = updateQuery.slice(0, -2);
  
    // Add the WHERE clause to target the specific user by ID
    updateQuery += ' WHERE user = ?';
    updateParams.push(id);
  
    try {
      // Execute the update query
      
      db.query(updateQuery, updateParams);
      return res.status(200).json({ msg: 'Stats updated successfully' });

    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'An error occurred while updating the user' });
    }
  
  }

export const orders = async (req:ReqAuth, res:Response) => {  
    try {
        const q =  "SELECT o.* u.username FROM orders o JOIN users i ON o.user = u.id"

        db.query(q,[],(err, orders:any) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({ error: "Internal server error" });
              }
        return res.json(orders)
            }
        )
    }catch(err){
        console.log(err)
    }
}



