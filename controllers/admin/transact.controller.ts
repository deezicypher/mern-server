import {Request, Response} from 'express'

import { db } from '../../config/db';
import { ReqAuth } from '../../types';
import shortid from 'shortid';





export const ledger = async (req:ReqAuth, res:Response) => {
    
    const q = "SELECT o.*, u.username FROM orders o LEFT JOIN users u ON o.user = u.id"
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
    
    const q = "SELECT o.*, u.username, u.id AS userId FROM orders o LEFT JOIN users u ON o.user = u.id WHERE o.id = ?"
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
   
    const { product,amount,method,txid,crypto,id} = req.body;
  
    // Build the update query dynamically based on provided parameters
    let updateQuery = 'UPDATE orders SET ';
    const updateParams:any = [];
  
   
  
    if (product) {
      updateQuery += 'product = ?, ';
      updateParams.push(product);
    }
    if (txid) {
        updateQuery += 'txid = ?, ';
        updateParams.push(txid);
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

export const deleteOrder = async (req:ReqAuth, res:Response) => {
   
    const {id} = req.body;

    const q = "DELETE FROM orders WHERE id=?"
  
    try { 

      db.query(q, id, (err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
        return res.status(200).json({ msg: 'Order deleted successfully' });
      });
     

    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'An error occurred while updating the user' });
    }
  
  }
  
export const deposit = async (req:ReqAuth, res:Response) => {

    const {amount, crypto,status, method, product, duration,id} = req.body

    const currentDate = new Date();

    const targetDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + duration,
        currentDate.getDate()
      );
        const q = "INSERT INTO orders (`product`,`amount`, `crypto`,`txid`, `method`, `status`,`dateordered`,`expires`,`user`) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)"
        const values = [
            product,amount,crypto,shortid(),method,status,currentDate,targetDate,id
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

    const {amount,duration,id} = req.body

    const currentDate = new Date();

    const targetDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + duration,
        currentDate.getDate()
      );
        const q = "INSERT INTO compounding (`amount`,`status`,`activated`,`expires`,`user`) VALUES (?, ?, ?, ?, ?)"
        const values = [
            amount,"PENDING",currentDate,targetDate,id
        ]
        const sq = "UPDATE  users SET  compounding = 1  WHERE id = ?"
try{ 
    db.query(q,values,(err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
          db.query(sq, [req.user?.id], (err, data) => {
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







export const approvecompounding = async (req:ReqAuth, res:Response) => {

    const {id, userId} = req.body


        const q = `UPDATE compounding SET status='APPROVED' WHERE id = ?`
        const values = [
            id
        ]
        const sq = "UPDATE  users SET  compounding = 2  WHERE id = ?"
try{ 
    db.query(q,values,(err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
    db.query(sq, [userId], (err, data) => {
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

export const getCompounding = async (req:ReqAuth, res:Response) => {
    const {id} = req.params
    const q = "SELECT c.*, u.username, u.id AS userId FROM compounding c JOIN users u ON c.user = u.id WHERE c.id = ?"
    try{
        db.query(q,[id], (err, compound) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({ error: "Internal server error" });
              }
          
            return res.status(200).json(compound)
        })
        
    }catch(err){
            console.log(err)
    }
}

export const updateCompounding = async (req:ReqAuth, res:Response) => {
   
    const { status,duration,id} = req.body;
  
    // Build the update query dynamically based on provided parameters
    let updateQuery = 'UPDATE withdrawals SET ';
    const updateParams:any = [];
  
   
  
    if (status) {
      updateQuery += 'status = ?, ';
      updateParams.push(status);
    }
    if (duration) {
        updateQuery += 'duration = ?, ';
        updateParams.push(duration);
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
        return res.status(200).json({ msg: 'Compound updated successfully' });
      });
     

    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'An error occurred while updating the user' });
    }
  
  }

export const compounds = async (req:ReqAuth, res:Response) => {

    const q = "SELECT c.*, u.username FROM compounding c JOIN users u ON c.user = u.id"
 
    try{
        db.query(q,[], (err, compounds) => {
   
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({ error: "Internal server error" });
              }
            return res.status(200).json(compounds)
        })
    
        
    }catch(err){
            console.log(err)
    }
}


export const withdrawals = async (req:ReqAuth, res:Response) => {

    const q = "SELECT w.*, u.username FROM withdrawals w JOIN users u ON w.user = u.id"
 
    try{
        db.query(q,[], (err, withdrawals) => {
   
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

export const getWithdrawal = async (req:ReqAuth, res:Response) => {
        const {id} = req.params
        const q = "SELECT w.*, u.username, u.id AS userId FROM withdrawals w JOIN users u ON w.user = u.id WHERE w.id = ?"
        try{
            db.query(q,[id], (err, withdrawal) => {
                if (err) {
                    console.error("Error executing query:", err);
                    return res.status(500).json({ error: "Internal server error" });
                  }
              
                return res.status(200).json(withdrawal)
            })
            
        }catch(err){
                console.log(err)
        }
    }
    

export const withdrawProfit = async (req:ReqAuth, res:Response) => {
    const {amount,method,txid,address, status,id} = req.body
  

    try{
    const q = "INSERT into withdrawals (`amount`, `method`,`txid`,`address`,`status`, `user`) VALUES (?, ?, ?, ?, ?, ?)"
    db.query(q,[amount, method,txid, address, status, id], (err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
        return res.json({msg:" Transaction Successful"})
    })
1
}catch(err){
    console.log(err)
    return res.status(500).json({error:err})
}

}



export const approveWithdrawal = async (req:ReqAuth, res:Response) => {

    const {id, amount, userId} = req.body


        const q = `UPDATE withdrawals SET status='APPROVED' WHERE id = ?`
   
        const sq = "UPDATE  stats  SET profit = CASE WHEN profit >= ? THEN profit - ? ELSE profit END  WHERE user = ?"

try{ 
    db.query(q,[id],(err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
    db.query(sq, [amount,amount, userId], (err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
        return res.json({msg: "Withdrawal Successful"})
    })
    })
}catch(err){
    console.log(err) 
    return res.status(500).json({error:err})
}
}

export const updateWithdrawal = async (req:ReqAuth, res:Response) => {
   
    const { status,amount,address,id} = req.body;
  
    // Build the update query dynamically based on provided parameters
    let updateQuery = 'UPDATE withdrawals SET ';
    const updateParams:any = [];
  
   
  
    if (status) {
      updateQuery += 'status = ?, ';
      updateParams.push(status);
    }
    if (amount) {
        updateQuery += 'amount = ?, ';
        updateParams.push(amount);
      }
  
    if (address) {
      updateQuery += 'address = ?, ';
      updateParams.push(address);
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
        return res.status(200).json({ msg: 'Withdrawals updated successfully' });
      });
     

    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'An error occurred while updating the user' });
    }
  
  }