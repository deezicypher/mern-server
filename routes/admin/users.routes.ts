import express from 'express';
import { verifyToken, verifyUser } from '../../middleware/verify';
import { getUsers, login, orders,getProfile, updateUser, updateStat } from '../../controllers/admin/users.controller';
import { updateProfile } from '../../controllers/users.controller';



const router = express.Router();

router.get('', getUsers)
router.get('/:id', getProfile)
router.post('/update/:id', updateUser)
router.post('/stats/update/:id', updateStat)
router.post('/login', login)
router.get('/orders', orders)

export default router

  