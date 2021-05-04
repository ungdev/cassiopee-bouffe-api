import { Router } from 'express';
import createOrder from './createOrder';
import login from './login';

const router = Router();

router.post('/login', login);
router.post('/:vendorId/orders', createOrder);

export default router;
