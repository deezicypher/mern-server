import {Request, Response} from 'express'

import { db } from '../../config/db';
import { ReqAuth } from '../../types';





export const ledger = async (req:ReqAuth, res:Response) => {
    
    const q = "SELECT o.*, u.username FROM orders o JOIN users u ON o.user = u.id"
    try{
        db.query(q,[req.user?.id], (err, orders) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({ error: "Internal server error" });
              }
            return res.status(200).json(orders)
        })
    
        
    }catch(err){
            console.log(err)
    }
}

export const getOrder = async (req:ReqAuth, res:Response) => {
    const {id} = req.params
    
    const q = "SELECT o.*, u.username, u.id AS userId FROM orders o JOIN users u ON o.user = u.id WHERE o.id = ?"
    try{
        
        db.query(q,[id], (err, order) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({ error: "Internal server error" });
              }
          
            return res.status(200).json(order)
        })
    
        
    }catch(err){
            console.log(err)
    }
}

export const updateOrder = async (req:ReqAuth, res:Response) => {
   
    const { product,amount,method,crypto,id} = req.body;
  
    // Build the update query dynamically based on provided parameters
    let updateQuery = 'UPDATE orders SET ';
    const updateParams:any = [];
  
   
  
    if (product) {
      updateQuery += 'product = ?, ';
      updateParams.push(product);
    }
    if (amount) {
        updateQuery += 'amount = ?, ';
        updateParams.push(amount);
      }
  
    if (method) {
      updateQuery += 'method = ?, ';
      updateParams.push(method);
    }
  
    if (crypto) {
      updateQuery += 'crypto = ?, ';
      updateParams.push(crypto);
    }
  
   
  
    // Remove the trailing comma and space from the update query
    updateQuery = updateQuery.slice(0, -2);
  
    // Add the WHERE clause to target the specific user by ID
    updateQuery += ' WHERE id = ?';
    updateParams.push(id);
  
    try { 
      // Execute the update query
      
      db.query(updateQuery, updateParams, (err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
        return res.status(200).json({ msg: 'Order updated successfully' });
      });
     

    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'An error occurred while updating the user' });
    }
  
  }


export const deposit = async (req:ReqAuth, res:Response) => {

    const {amount, amountcrypto,status, method, product, txid, duration} = req.body

    const currentDate = new Date();

    const targetDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + duration,
        currentDate.getDate()
      );
        const q = "INSERT INTO orders (`product`,`amount`, `crypto`,`txid`, `method`, `status`,`dateordered`,`expires`,`user`) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)"
        const values = [
            product,amount,amountcrypto,txid,method,status,currentDate,targetDate,req.user?.id
        ]
try{ 
    db.query(q,values,(err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
        res.json({msg:" Transaction Pending"})
    })
}catch(err){
    console.log(err) 
    return res.status(500).json({error:err})
}
}


export const compound = async (req:ReqAuth, res:Response) => {

    const {amount,duration} = req.body

    const currentDate = new Date();

    const targetDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + duration,
        currentDate.getDate()
      );
        const q = "INSERT INTO compounding (`amount`,`status`,`activated`,`expires`,`user`) VALUES (?, ?, ?, ?, ?)"
        const values = [
            amount,"PENDING",currentDate,targetDate,req.user?.id
        ]
try{ 
    db.query(q,values,(err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
        res.json({msg:" Transaction Pending"})
    })
}catch(err){
    console.log(err) 
    return res.status(500).json({error:err})
}
}



export const approvedeposit = async (req:ReqAuth, res:Response) => {

   
    const {userId,amount,id } = req.body


        const q = `UPDATE orders SET status='APPROVED' WHERE id = ?`
        const values = [
            id
        ]
        const sq = "UPDATE  stats SET  capital = capital + ? WHERE user = ?"
try{ 
    db.query(q,values,(err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
    db.query(sq, [amount, userId], (err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
        return res.json({msg:" Order Approved"})
    })
    })
}catch(err){
    console.log(err) 
    return res.status(500).json({error:err})
}
}



/*
const user = prisma.user.findUnique({
    where:{
        id:req.user?.id,
    },
    include:{
        plans: {
            select: {
              id: true,
              amount: true,
            },
          },
        referredUser: true,
    }
})


if (user?.referredUser) {
    const totalAmounts: Record<number, number> = {};
  
    for (const plan of [...user.plans]) {
      const { id, amount } = plan;
      if (totalAmounts[id]) {
        totalAmounts[id] += amount;
      } else {
        totalAmounts[id] = amount;
      }
    }

}*/



export const approvecompounding = async (req:ReqAuth, res:Response) => {

    const {id} = req.params


        const q = `UPDATE compounding SET status='APPROVED' WHERE user = ?`
        const values = [
            id
        ]
        const sq = "UPDATE  users SET  compounding = 1  WHERE id = ?"
try{ 
    db.query(q,values,(err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
    db.query(sq, [id], (err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
        return res.json({msg: "Compounding Successful"})
    })
    })
}catch(err){
    console.log(err) 
    return res.status(500).json({error:err})
}
}

export const withdrawProfit = async (req:ReqAuth, res:Response) => {
    const {amount,method,txid,address, status} = req.body
    const id  = req.user?.id

    try{
    const q = "INSERT into withdrawals (`amount`, `method`,`txid`,`address`,`status`, `user`) VALUES (?, ?, ?, ?, ?, ?)"
    db.query(q,[amount, method,txid, address, status, id], (err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
        return res.json({msg:" Transaction Successful"})
    })

}catch(err){
    console.log(err)
    return res.status(500).json({error:err})
}

}


