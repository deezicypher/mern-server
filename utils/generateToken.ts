import jwt from 'jsonwebtoken'
import { Response } from 'express'
import dotenv from "dotenv"
dotenv.config()

const {
  ACTIVE_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET
} = process.env

export const generateActiveToken = (payload: object) => {
  return jwt.sign(payload, `${ACTIVE_TOKEN_SECRET}`, {expiresIn: '1d'})
}

export const generateAccessToken = (payload: object, res: Response) => {
  const access_token = jwt.sign(payload, `${ACCESS_TOKEN_SECRET}`, {expiresIn: '1d'})
  
  res.cookie('accesstoken', access_token, {
    httpOnly: true,
  })

return access_token
}
/*export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, `${ACCESS_TOKEN_SECRET}`, {expiresIn: '15m'})
  
}
*/
export const generateRefreshToken = (payload: object, res: Response) => {
  const refresh_token = jwt.sign(payload, `${REFRESH_TOKEN_SECRET}`, {expiresIn: '30d'})
  
  res.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    path: `/api/users/refresh_token`,
    maxAge: 30*24*60*60*1000 // 30days
  })
  
  return refresh_token;
}