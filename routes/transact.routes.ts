import express from 'express'
import { approvedeposit, compound, compounding, deposit, ledger, withdrawProfit, withdrawals } from '../controllers/transact.controller'
import { Router } from 'express'
import { verifyToken } from '../middleware/verify'

const router = Router()

router.post('/deposit', verifyToken, deposit)
router.post('/compound', verifyToken, compound)
router.get('/compound', verifyToken, compounding)
router.patch('/updatedeposit', verifyToken, approvedeposit)
router.post('/withdrawprofit', verifyToken, withdrawProfit)
router.get('/ledger', verifyToken, ledger)
router.get('/withdraws', verifyToken, withdrawals)

 
export default router