import { Request } from 'express'

export interface User {
    refcode: string,
    id    :       number,           
    fullname:     string,
    email :       string,       
    username :    string,
    phone :       number,
    password :    string,
    referralCode: string,
    rf_token:     string,
    twoFA :       boolean,       
    joined :      Date,      
    role:         string     
}

export interface Error {
    status: number,
    message: string,
}



export interface DecodedToken {
  id?: string
  newuser?: User
  iat: number
  exp: number
}



export interface UserParams {
  name: string 
  account: string 
  password: string
  avatar?: string
  type: string
}

export interface ReqAuth extends Request {
  user?: User
}




