import {Request, Response} from 'express'

import { db } from '../config/db';
import { ReqAuth } from '../types';





export const ledger = async (req:ReqAuth, res:Response) => {
    
    const q = "SELECT * FROM orders WHERE user = ?"
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


export const deposit = async (req:ReqAuth, res:Response) => {

    const {amount, amountcrypto,status, method, product, txid, duration} = req.body
    console.log(req.body)
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
        const cuq = "SELECT * FROM users WHERE id=? AND compounding !== 0 "
        const q = "INSERT INTO compounding (`amount`,`status`,`duration`, `activated`,`expires`,`user`) VALUES (?, ?, ?,?,?, ?)"
        const values = [
            amount,"PENDING",duration,currentDate,targetDate,req.user?.id
        ]
        const uq = "UPDATE  users SET compounding  = 1 WHERE id = ?"
try{ 

    db.query(q,values,(err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
          db.query(uq, [req.user?.id], (err, data) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({ error: "Internal server error" });
              }
        return res.json({msg:" Transaction Pending"})
            })
    })
}catch(err){
    console.log(err) 
    return res.status(500).json({error:err})
}
}

export const compounding = async (req:ReqAuth, res:Response) => {

    const q = "SELECT * FROM compounding WHERE user = ?"
    try{
        db.query(q,[req.user?.id], (err, compound) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({ error: "Internal server error" });
              }
           return  res.status(200).json(compound)
        })
      
       
        
    }catch(err){
            console.log(err)
    }
}

export const approvedeposit = async (req:ReqAuth, res:Response) => {

    const {txid,amount} = req.body


        const q = `UPDATE orders SET status='APPROVED' WHERE txid = ?`
        const values = [
            txid
        ]
        const sq = "UPDATE  stats SET  capital = capital + ? WHERE user = ?"
try{ 
    db.query(q,values,(err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
    db.query(sq, [amount, req.user?.id], (err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
        return res.json({msg:" Transaction Successful"})
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




export const withdrawProfit = async (req:ReqAuth, res:Response) => {
    const {amount,txid,address} = req.body
    const id  = req.user?.id

    try{
    const q = "INSERT into withdrawals (`amount`,`txid`,`address`,`status`, `user`) VALUES (?, ?, ?, ?, ?)"

    db.query(q,[amount,txid, address,"PENDING", id], (err, data) => {
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


export const withdrawals = async (req:ReqAuth, res:Response) => {
    
    const q = "SELECT * FROM withdrawals WHERE user = ?"
    try{
        db.query(q,[req.user?.id], (err, withdrawals) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({ error: "Internal server error" });
              }
            return res.status(200).json(withdrawals)
        })
              
    }catch(err){
            console.log(err)
    }
}