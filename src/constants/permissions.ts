import { UserRole } from "./roles";

export const Permissions = {
  MANAGE_USERS: [UserRole.ADMINISTRATOR],
  VIEW_USERS: [UserRole.ADMINISTRATOR, UserRole.SUPERVISOR],
  UPDATE_USERS: [UserRole.ADMINISTRATOR],
  DELETE_USERS: [UserRole.ADMINISTRATOR],
};
