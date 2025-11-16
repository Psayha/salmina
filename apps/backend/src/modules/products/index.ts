/**
 * @file index.ts
 * @description Products module exports
 * @author AI Assistant
 * @created 2024-11-13
 */

export { productsService, ProductsService } from './products.service.js';
export { productsController, ProductsController } from './products.controller.js';
export { default as productsRoutes } from './products.routes.js';

// Export types
export * from './products.types.js';
export * from './products.validation.js';
