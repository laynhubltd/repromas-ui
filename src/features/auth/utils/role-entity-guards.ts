import type {
  AuthCandidateEntity,
  AuthDepartmentEntity,
  AuthFacultyEntity,
  AuthProgramEntity,
  AuthRoleScope,
  AuthStudentEntity,
  RoleEntity,
} from "../types/role-entity";

export function isAuthFacultyEntity(
  scope: AuthRoleScope,
  entity: RoleEntity,
): entity is AuthFacultyEntity {
  return (
    scope === "FACULTY" &&
    entity !== null &&
    typeof entity === "object" &&
    "code" in entity &&
    !("facultyId" in entity) &&
    !("matricNumber" in entity) &&
    !("jambRegNo" in entity)
  );
}

export function isAuthDepartmentEntity(
  scope: AuthRoleScope,
  entity: RoleEntity,
): entity is AuthDepartmentEntity {
  return (
    scope === "DEPARTMENT" &&
    entity !== null &&
    typeof entity === "object" &&
    "facultyId" in entity &&
    "faculty" in entity
  );
}

export function isAuthProgramEntity(
  scope: AuthRoleScope,
  entity: RoleEntity,
): entity is AuthProgramEntity {
  return (
    scope === "PROGRAM" &&
    entity !== null &&
    typeof entity === "object" &&
    "departmentId" in entity &&
    "degreeTitle" in entity &&
    "department" in entity
  );
}

export function isAuthStudentEntity(
  scope: AuthRoleScope,
  entity: RoleEntity,
): entity is AuthStudentEntity {
  return (
    scope === "STUDENT" &&
    entity !== null &&
    typeof entity === "object" &&
    "matricNumber" in entity
  );
}

export function isAuthCandidateEntity(
  scope: AuthRoleScope,
  entity: RoleEntity,
): entity is AuthCandidateEntity {
  return (
    scope === "CANDIDATE" &&
    entity !== null &&
    typeof entity === "object" &&
    "jambRegNo" in entity
  );
}
