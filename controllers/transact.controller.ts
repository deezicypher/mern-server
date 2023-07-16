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
            res.status(200).json(orders)
        })
      
       
        
    }catch(err){
            console.log(err)
    }
}


export const deposit = async (req:ReqAuth, res:Response) => {

    const {amount, amountcrypto,status, method, plan, txid, duration,id} = req.body

    const currentDate = new Date();

    const targetDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + duration,
        currentDate.getDate()
      );
        const q = "INSERT into orders (`name`,`amount`, 'crypto`,`txid`, `method`, `status`,`dateordered`,`expires`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        const values = [
            plan,amount,amountcrypto,txid,method,status,currentDate,targetDate
        ]
        const sq = "UPDATE  stats SET  capital = capital + ? "
try{
    db.query(q,values,(err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
    db.query(sq, [amount], (err, data) => {
        res.json({msg:" Transaction Successful"})
    })
    })
}catch(err){
    console.log(err)
    return res.status(500).json({error:err})
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
        res.json({msg:" Transaction Successful"})
    })

}catch(err){
    console.log(err)
    return res.status(500).json({error:err})
}

}


