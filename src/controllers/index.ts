import { Router } from 'express';

import root from './root';
import vendors from './vendors';

const router = Router();

// Root routes
router.use(root);

router.use('/vendors', vendors);

export default router;
