import express from 'express';
import { verifyToken, verifyUser } from '../../middleware/verify';
import { getUsers, login, orders,getProfile, updateUser, updateStat, getStanding, create, getStat } from '../../controllers/admin/users.controller';
import { updateProfile } from '../../controllers/users.controller';



const router = express.Router();

router.get('', getUsers)
router.get('/standing',verifyToken, getStanding)
router.get('/:id',verifyToken, getProfile)
router.get('/stat/:id',verifyToken,getStat)
router.post('/create', verifyToken, create)
router.post('/update/:id', verifyToken, updateUser)
router.post('/stats/update/:id',verifyToken, updateStat)
router.post('/login', login)
router.get('/orders',verifyToken, orders)

export default router

  