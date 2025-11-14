/**
 * @file index.ts
 * @description Products module exports
 * @author AI Assistant
 * @created 2024-11-13
 */

export { productsService, ProductsService } from './products.service';
export { productsController, ProductsController } from './products.controller';
export { default as productsRoutes } from './products.routes';

// Export types
export * from './products.types';
export * from './products.validation';
