/**
 * @file index.ts
 * @description User module exports
 * @author AI Assistant
 * @created 2024-11-13
 */

// Export routes
export { userRoutes, createUserRoutes } from './users.routes.js';

// Export service
export { userService, UserService } from './users.service.js';

// Export controller
export { userController, UserController } from './users.controller.js';

// Export types
export type {
  UserDTO,
  UpdateUserProfileDTO,
  UpdateUserRoleDTO,
  PaginationParams,
  UserFilters,
  PaginatedUsersResponse,
  AcceptTermsResponse,
} from './users.types.js';

export { toUserDTO, toUserDTOList } from './users.types.js';

// Export validation schemas and types
export {
  updateUserProfileSchema,
  acceptTermsSchema,
  updateUserRoleSchema,
  getAllUsersQuerySchema,
  userIdParamSchema,
} from './users.validation.js';

export type {
  UpdateUserProfileInput,
  UpdateUserRoleInput,
  GetAllUsersQuery,
  UserIdParam,
} from './users.validation.js';
