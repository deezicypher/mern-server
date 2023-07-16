import express from 'express';
import { verifyToken, verifyUser } from '../middleware/verify';
import { ApproveOrder, getUsers, orders } from '../controllers/admin.controller';


const router = express.Router();

router.get('/', getUsers)
router.get('/orders', orders)
router.get('/tx/approve', ApproveOrder)
export default router

 