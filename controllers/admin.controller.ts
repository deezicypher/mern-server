import {Request, Response} from 'express'
import { db } from '../config/db';
import { ReqAuth } from '../types';




export const getUsers = async (req: Request, res: Response) => {
    try {

        const q =  "SELECT u.* FROM users u JOIN stats s ON s.user = u.id"

        db.query(q,[],(err, users:any) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({ error: "Internal server error" });
              }
        res.json(users)
            }
        )
    }catch(err){
        console.log(err)
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
        res.json(orders)
            }
        )
    }catch(err){
        console.log(err)
    }
}

export const ApproveOrder = async (req:ReqAuth, res:Response) => {
    const {planId} = req.body
    const q = "UPDATE orders SET status = ? where id = ?"
    try{
        db.query(q, ["APPROVED", planId], (err, data) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({ error: "Internal server error" });
              }
            res.status(200).json(data)
        })
        
    }catch(err){
            console.log(err)
    }
}