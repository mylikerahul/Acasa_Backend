import express from 'express';
import * as AdminMenuController from '../../controllers/admin/admin_menu.controller.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';

const router = express.Router();

// Public Routes (for frontend menu rendering)
router.get('/', AdminMenuController.getActiveMenus);
router.get('/hierarchy/:id', AdminMenuController.getMenuHierarchy);

// Admin Routes - Menus
router.post('/create', isAuthenticated, isAdmin, AdminMenuController.createMenu);
router.put('/update/:id', isAuthenticated, isAdmin, AdminMenuController.updateMenu);
router.delete('/delete/:id', isAuthenticated, isAdmin, AdminMenuController.deleteMenu);
router.patch('/reorder', isAuthenticated, isAdmin, AdminMenuController.updateMenuOrder);

// Admin Routes - Items
router.post('/item/create', isAuthenticated, isAdmin, AdminMenuController.createMenuItem);
router.put('/item/update/:id', isAuthenticated, isAdmin, AdminMenuController.updateMenuItem);
router.delete('/item/delete/:id', isAuthenticated, isAdmin, AdminMenuController.deleteMenuItem);

// Admin Routes - Submenu
router.post('/submenu/create', isAuthenticated, isAdmin, AdminMenuController.createSubmenuItem);
router.put('/submenu/update/:id', isAuthenticated, isAdmin, AdminMenuController.updateSubmenuItem);
router.delete('/submenu/delete/:id', isAuthenticated, isAdmin, AdminMenuController.deleteSubmenuItem);

export default router;