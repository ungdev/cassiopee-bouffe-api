import { Router } from 'express';

import root from './root';

const router = Router();

// Root routes
router.use(root);

export default router;
