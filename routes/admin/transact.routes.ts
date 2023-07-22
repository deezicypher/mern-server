import express from 'express'
import { approvecompounding, approvedeposit,  getOrder,  ledger, updateOrder, } from '../../controllers/admin/transact.controller'
import { Router } from 'express'
import { verifyToken } from '../../middleware/verify'

const router = Router()


router.get('/', verifyToken, ledger)
router.get('/:id', verifyToken,getOrder)
router.patch('/approvedeposit', verifyToken, approvedeposit)
router.patch('/updatedeposit', verifyToken, updateOrder)
router.post('/compounding/approve', approvecompounding)
 
export default router