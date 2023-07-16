import { Request, Response , NextFunction} from 'express';
import jwt,{ JwtPayload } from 'jsonwebtoken'
import { DecodedToken, ReqAuth, User } from '../types'


export const verifyToken = (req:ReqAuth, res:Response, next:NextFunction) => {
  
    const token =  req.header("Authorization") //req.cookies.access_token;
    if(!token) return res.status(401).json({msg:"You're not authenticated"})
    

    jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`, (err: any, user:any) => {
      if (err) {
        res.status(403).json('Token is not valid');
        return;
      }
      req.user = user;
      next();
    });
}

export const verifyUser = (req:ReqAuth, res:Response, next:NextFunction) => {
  verifyToken(req, res,() => {
   
      if(req.user?.id === req.query.id || req.user?.role === "ADMIN"){
          next()
      }else{
        return res.json(403).json("You're not authorized")
      }
  })
}



export const verifyAdmin = (req:ReqAuth, res:Response, next:NextFunction) => {
    verifyToken(req, res,() => {
        if(req.user?.role === "ADMIN") return next()
        else return res.json(403).json("You're not an administrator")
    })
}