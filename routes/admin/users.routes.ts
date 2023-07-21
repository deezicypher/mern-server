import express from 'express';
import { verifyToken, verifyUser } from '../../middleware/verify';
import { ApproveOrder, getUsers, login, orders,getProfile, updateUser, updateStat } from '../../controllers/admin/users.controller';
import { updateProfile } from '../../controllers/users.controller';



const router = express.Router();

router.get('/users', getUsers)
router.get('/users/:id', getProfile)
router.post('/users/update/:id', updateUser)
router.post('/users/stats/update/:id', updateStat)
router.post('/login', login)
router.get('/orders', orders)
router.get('/tx/approve', ApproveOrder)
export default router

  