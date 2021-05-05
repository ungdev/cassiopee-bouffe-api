import { Router } from 'express';
import createOrder from './createOrder';
import editOrder from './editOrder';
import getOrders from './getOrders';
import getRestrictedOrders from './getRestrictedOrders';
import getVendors from './getVendors';
import login from './login';

const router = Router();

router.get('//', getVendors);
router.post('/login', login);
router.get('/me/orders', getOrders);
router.patch('/me/orders/:orderId', editOrder);
router.get('/:vendorId/orders', getRestrictedOrders);
router.post('/:vendorId/orders', createOrder);

export default router;
