import express from 'express';
import userRoutes from './users.routes'
import transactRoutes from './transact.routes'
import withdawRoutes from './w.routes'
import compoundRoutes from './c.routes'

const router = express.Router();

router.use('/users', userRoutes )
router.use('/ledger', transactRoutes)
router.use('/withdrawal', withdawRoutes)
router.use('/compounds', compoundRoutes)

export default router
