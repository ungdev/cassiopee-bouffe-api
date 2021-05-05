import { Router } from 'express';
import yaml from 'yamljs';
import swagger from 'swagger-ui-express';

import root from './root';
import vendors from './vendors';
import callbacks from './callbacks';

const swaggerDocument = yaml.load('openapi.yml');

const router = Router();

// Root routes
router.use(root);

router.use('/vendors', vendors);
router.use('/callbacks', callbacks);
router.use('/docs', swagger.serve, swagger.setup(swaggerDocument));

export default router;
