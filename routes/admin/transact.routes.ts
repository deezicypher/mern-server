import express from 'express'
import { approveWithdrawal, approvecompounding, approvedeposit,  deleteOrder,  deposit,  getOrder,  getWithdrawal,  ledger, updateOrder, updateWithdrawal, withdrawals, } from '../../controllers/admin/transact.controller'
import { Router } from 'express'
import { verifyToken } from '../../middleware/verify'

const router = Router()


router.get('/', verifyToken, ledger)
router.post('/create', verifyToken, deposit)
router.patch('/approvedeposit', verifyToken, approvedeposit)
router.patch('/updatedeposit', verifyToken, updateOrder)
router.post('/compounding/approve', approvecompounding)
router.get('/:id', verifyToken,getOrder)
router.post('/delete/:id', verifyToken, deleteOrder)

export default router
