import { RoleAccessLevels } from "@cuttinboard/cuttinboard-library/utils";

/**
 * Get the role access level for the given employee as string (e.g. "owner", "manager", "employee")
 * @param role Access level of the employee
 * @returns Role access level as a string
 */
export const getRoleTextByNumber = (role: number) => {
  return Object.entries(RoleAccessLevels).find(([, n]) => n === role)?.[0];
};
