/**
 * Роуты для управления блоками (админка)
 * Все роуты защищены JWT авторизацией
 */

import express from 'express';
import AdminBlocksController from '../../controllers/AdminBlocksController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authMiddleware);

// CRUD операции с блоками
router.get('/blocks', AdminBlocksController.getAllBlocks.bind(AdminBlocksController));
router.get('/blocks/:id', AdminBlocksController.getBlockById.bind(AdminBlocksController));
router.post('/blocks', AdminBlocksController.createBlock.bind(AdminBlocksController));
router.put('/blocks/:id', AdminBlocksController.updateBlock.bind(AdminBlocksController));
router.delete('/blocks/:id', AdminBlocksController.deleteBlock.bind(AdminBlocksController));
router.put('/blocks/:id/order', AdminBlocksController.updateBlockOrder.bind(AdminBlocksController));

// Управление переводами блоков
router.get('/blocks/:id/translations', AdminBlocksController.getBlockTranslations.bind(AdminBlocksController));
router.post('/blocks/:id/translations', AdminBlocksController.createBlockTranslation.bind(AdminBlocksController));
router.put('/blocks/:id/translations/:lang', AdminBlocksController.updateBlockTranslation.bind(AdminBlocksController));
router.delete('/blocks/:id/translations/:lang', AdminBlocksController.deleteBlockTranslation.bind(AdminBlocksController));

export default router;

