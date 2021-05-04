import { Router } from 'express';

import status from './status';

const router = Router();

// To match only with root
router.get('//', status);

export default router;
