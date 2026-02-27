import * as AdminMenuModel from '../../models/admin/admin_menu.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

// ==================== MENUS ====================

export const getActiveMenus = catchAsyncErrors(async (req, res, next) => {
  const result = await AdminMenuModel.getActiveMenus();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch menus', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const getMenuHierarchy = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Menu ID is required', 400));
  }

  const result = await AdminMenuModel.getMenuHierarchy(id);

  if (!result.success) {
    return next(new ErrorHandler('Menu not found', 404));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const createMenu = catchAsyncErrors(async (req, res, next) => {
  const { name, menu_url, order_num, menu_type, column_num, status, for_country } = req.body;

  if (!name) {
    return next(new ErrorHandler('Menu name is required', 400));
  }

  const menuData = {
    name,
    menu_url,
    order_num: order_num ? parseInt(order_num) : 0,
    menu_type: menu_type ? parseInt(menu_type) : 1,
    column_num: column_num ? parseInt(column_num) : 1,
    status: status !== undefined ? parseInt(status) : 1,
    for_country
  };

  const result = await AdminMenuModel.createMenu(menuData);

  if (!result.success) {
    return next(new ErrorHandler('Failed to create menu', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Menu created successfully',
    menuId: result.menuId
  });
});

export const updateMenu = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Menu ID is required', 400));
  }

  const result = await AdminMenuModel.updateMenu(id, req.body);

  if (!result.success) {
    return next(new ErrorHandler('Failed to update menu', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Menu updated successfully'
  });
});

export const deleteMenu = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Menu ID is required', 400));
  }

  const result = await AdminMenuModel.deleteMenu(id);

  if (!result.success) {
    return next(new ErrorHandler('Failed to delete menu', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Menu deleted successfully'
  });
});

// ==================== MENU ITEMS ====================

export const createMenuItem = catchAsyncErrors(async (req, res, next) => {
  const { menu_id, label, link, parent, sort, class_name, depth, ...otherFields } = req.body;

  if (!menu_id || !label) {
    return next(new ErrorHandler('Menu ID and label are required', 400));
  }

  const itemData = {
    menu: parseInt(menu_id),
    label,
    link,
    parent: parent ? parseInt(parent) : 0,
    sort: sort ? parseInt(sort) : 0,
    class: class_name,
    depth: depth ? parseInt(depth) : 0,
    ...otherFields
  };

  const result = await AdminMenuModel.createMenuItem(itemData);

  if (!result.success) {
    return next(new ErrorHandler('Failed to create menu item', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Menu item created successfully',
    itemId: result.itemId
  });
});

export const updateMenuItem = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Item ID is required', 400));
  }

  const result = await AdminMenuModel.updateMenuItem(id, req.body);

  if (!result.success) {
    return next(new ErrorHandler('Failed to update menu item', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Menu item updated successfully'
  });
});

export const deleteMenuItem = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Item ID is required', 400));
  }

  const result = await AdminMenuModel.deleteMenuItem(id);

  if (!result.success) {
    return next(new ErrorHandler('Failed to delete menu item', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Menu item deleted successfully'
  });
});

// ==================== SUBMENU ITEMS ====================

export const createSubmenuItem = catchAsyncErrors(async (req, res, next) => {
  const { parent_id, label, item_link, item_order, ...otherFields } = req.body;

  if (!parent_id || !label) {
    return next(new ErrorHandler('Parent ID and label are required', 400));
  }

  const subData = {
    parent: parseInt(parent_id),
    label,
    item_link,
    item_order: item_order ? parseInt(item_order) : 0,
    ...otherFields
  };

  const result = await AdminMenuModel.createSubmenuItem(subData);

  if (!result.success) {
    return next(new ErrorHandler('Failed to create submenu item', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Submenu item created successfully',
    submenuId: result.submenuId
  });
});

export const updateSubmenuItem = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Submenu ID is required', 400));
  }

  const result = await AdminMenuModel.updateSubmenuItem(id, req.body);

  if (!result.success) {
    return next(new ErrorHandler('Failed to update submenu item', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Submenu item updated successfully'
  });
});

export const deleteSubmenuItem = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Submenu ID is required', 400));
  }

  const result = await AdminMenuModel.deleteSubmenuItem(id);

  if (!result.success) {
    return next(new ErrorHandler('Failed to delete submenu item', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Submenu item deleted successfully'
  });
});

export const updateMenuOrder = catchAsyncErrors(async (req, res, next) => {
  const { orders } = req.body;

  if (!orders || !Array.isArray(orders)) {
    return next(new ErrorHandler('Orders array is required', 400));
  }

  const result = await AdminMenuModel.updateMenuOrder(orders);

  if (!result.success) {
    return next(new ErrorHandler('Failed to update order', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Menu order updated successfully'
  });
});

export default {
  getActiveMenus,
  getMenuHierarchy,
  createMenu,
  updateMenu,
  deleteMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createSubmenuItem,
  updateSubmenuItem,
  deleteSubmenuItem,
  updateMenuOrder
};