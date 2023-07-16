import express from 'express'
import { deposit, ledger, withdrawProfit } from '../controllers/transact.controller'
import { Router } from 'express'
import { verifyToken } from '../middleware/verify'

const router = Router()

router.post('/deposit', verifyToken, deposit)
router.post('/withdrawprofit', verifyToken, withdrawProfit)
router.get('/ledger', verifyToken, ledger)

 
export default router