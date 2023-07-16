import express from 'express';
import { activeAccount, enable2fa, forgetPassword,  getProfile, login, register, resendEmail, resetPass, verifyotp } from '../controllers/users.controller';
import { validLogin, validSigup } from '../middleware/valid';
import { check } from 'express-validator';
import { verifyToken, verifyUser } from '../middleware/verify';


const router = express.Router();

router.get('/profile',verifyToken,getProfile)
router.post('/signup',validSigup, register)
router.post('/login', validLogin,login)
router.post('/enable-2fa', verifyToken, enable2fa)
router.post('/verify-2fa', verifyToken, verifyotp)
router.post('/resend-email', check('email').isEmail().withMessage('Must be a valid email address'),resendEmail)
router.post('/activate', check('email').isEmail().withMessage('Must be a valid email address'),activeAccount)
router.post('/forgot-password', check('email').isEmail().withMessage('Must be a valid email address'),forgetPassword)
router.post('/reset-password', 
check('email').isEmail().withMessage('Must be a valid email address'),
check('password', 'Password is required').notEmpty(),
check('password').isLength({ min: 6 }).withMessage('Password must contain at least 6 characters')
.matches(/\d/).withMessage('Password must contain a number'),
resetPass)


export default router

 