import express from 'express'
import { approvecompounding, compounds, getCompounding, updateCompounding } from '../../controllers/admin/transact.controller'
import { Router } from 'express'
import { verifyToken } from '../../middleware/verify'

const router = Router()


router.get('/', compounds)
router.get('/:id', verifyToken, getCompounding)
router.patch('/approve', verifyToken, approvecompounding)
router.patch('/update', verifyToken, updateCompounding)


export default router