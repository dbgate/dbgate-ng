import { Router } from "express";
import connectionsController from "../controllers/connections";

const router: Router = Router();

// POST /api/connections/list - List all connections
router.post("/list", connectionsController.list);

// POST /api/connections/get - Get specific connection
router.post("/get", connectionsController.get);

// POST /api/connections/test - Test connection
router.post("/test", connectionsController.test);

// POST /api/connections/save - Save connection (not implemented for env-based)
router.post("/save", connectionsController.save);

// POST /api/connections/delete - Delete connection (not implemented for env-based)
router.post("/delete", connectionsController.delete);

// POST /api/connections/newSqliteDatabase - Create new SQLite database
router.post("/newSqliteDatabase", connectionsController.newSqliteDatabase);

// POST /api/connections/refresh - Refresh connections from environment
router.post("/refresh", connectionsController.refresh);

export default router;
