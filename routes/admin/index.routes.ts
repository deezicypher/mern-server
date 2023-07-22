import express from 'express';
import userRoutes from './users.routes'
import transactRoutes from './transact.routes'

const router = express.Router();

router.use('/users', userRoutes )
router.use('/ledger', transactRoutes)

export default router
