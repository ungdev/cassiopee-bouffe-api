import { Router } from 'express';

import root from './root';
import vendors from './vendors';
import callbacks from './callbacks';

const router = Router();

// Root routes
router.use(root);

router.use('/vendors', vendors);
router.use('/callbacks', callbacks);

export default router;
