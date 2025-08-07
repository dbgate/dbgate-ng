import { Router } from 'express';
import connectionsController from '../controllers/connections';

const router: Router = Router();

// GET /api/connections - List all connections
router.get('/', connectionsController.list);

// GET /api/connections/:conid - Get specific connection
router.get('/:conid', connectionsController.get);

// POST /api/connections/test - Test connection
router.post('/test', connectionsController.test);

// POST /api/connections - Save connection (not implemented for env-based)
router.post('/', connectionsController.save);

// DELETE /api/connections/:conid - Delete connection (not implemented for env-based)
router.delete('/:conid', connectionsController.delete);

// POST /api/connections/new-sqlite-database - Create new SQLite database
router.post('/new-sqlite-database', connectionsController.newSqliteDatabase);

// POST /api/connections/refresh - Refresh connections from environment
router.post('/refresh', connectionsController.refresh);

export default router;
