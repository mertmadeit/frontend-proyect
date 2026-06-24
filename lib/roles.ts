export const USER_ROLES = ["admin", "supervisor", "empleado"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function normalizeUserRole(role: unknown): UserRole {
  return USER_ROLES.includes(role as UserRole)
    ? (role as UserRole)
    : "empleado";
}

export function getUserRoleLabel(role: UserRole) {
  if (role === "admin") return "Administrador";
  if (role === "supervisor") return "Supervisor";
  return "Empleado";
}
