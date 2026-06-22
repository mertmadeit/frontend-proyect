export const USER_ROLES = ["admin", "supervisor"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function normalizeUserRole(role: unknown): UserRole {
  return role === "admin" ? "admin" : "supervisor";
}

export function getUserRoleLabel(role: UserRole) {
  return role === "admin" ? "Administrador" : "Supervisor";
}
