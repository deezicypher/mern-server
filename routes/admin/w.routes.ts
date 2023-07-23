import express from 'express'
import { approveWithdrawal,   getWithdrawal,  updateWithdrawal, withdrawals, } from '../../controllers/admin/transact.controller'
import { Router } from 'express'
import { verifyToken } from '../../middleware/verify'

const router = Router()


router.get('/', withdrawals)
router.get('/:id', verifyToken, getWithdrawal)
router.patch('/approve', verifyToken, approveWithdrawal)
router.patch('/update', verifyToken, updateWithdrawal)


export default router