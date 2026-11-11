// ============================================================
// PERMISOS Y MENÚS POR ROL
// ============================================================

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN_INSTITUCIONAL: "ADMIN_INSTITUCIONAL",
  COORDINADOR: "COORDINADOR",
  SECRETARIA: "SECRETARIA",
  DOCENTE: "DOCENTE",
  DIRECTOR_GRUPO: "DIRECTOR_GRUPO",
  PSICOORIENTADOR: "PSICOORIENTADOR",
  ESTUDIANTE: "ESTUDIANTE",
  PADRE: "PADRE",
};

export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Administrador",
  ADMIN_INSTITUCIONAL: "Administrador Institucional",
  COORDINADOR: "Coordinador Académico",
  SECRETARIA: "Secretaría Académica",
  DOCENTE: "Docente",
  DIRECTOR_GRUPO: "Director de Grupo",
  PSICOORIENTADOR: "Psicoorientador",
  ESTUDIANTE: "Estudiante",
  PADRE: "Padre de Familia",
};

export const ROLE_COLORS = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800",
  ADMIN_INSTITUCIONAL: "bg-blue-100 text-blue-800",
  COORDINADOR: "bg-indigo-100 text-indigo-800",
  SECRETARIA: "bg-cyan-100 text-cyan-800",
  DOCENTE: "bg-green-100 text-green-800",
  DIRECTOR_GRUPO: "bg-teal-100 text-teal-800",
  PSICOORIENTADOR: "bg-orange-100 text-orange-800",
  ESTUDIANTE: "bg-yellow-100 text-yellow-800",
  PADRE: "bg-pink-100 text-pink-800",
};

export const permissions = {
  SUPER_ADMIN: [
    "global.dashboard", "institutions.manage", "licenses.manage",
    "modules.manage", "backup.manage", "audit.global.read",
    "security.global.manage", "stats.global.read",
  ],
  ADMIN_INSTITUCIONAL: [
    "users.manage", "courses.manage", "subjects.manage",
    "periods.manage", "reports.institution", "grades.read",
    "attendance.read", "assignments.manage",
  ],
  COORDINADOR: [
    "grades.consolidated.read", "teachers.performance.read",
    "grade.change.approve", "improvement.plans.manage",
    "meetings.manage", "reports.academic",
  ],
  SECRETARIA: [
    "enrollment.manage", "documents.manage",
    "certificates.generate", "student.basic.read",
  ],
  DOCENTE: [
    "courses.assigned.read", "grades.create", "grades.edit.open",
    "attendance.create", "tasks.create", "materials.upload",
    "reports.own.courses",
  ],
  DIRECTOR_GRUPO: [
    "group.assigned.read", "observer.manage",
    "citations.send", "group.reports",
  ],
  PSICOORIENTADOR: [
    "cases.assigned.read", "attention.history.manage",
    "appointments.manage", "support.plans.manage",
    "alerts.create",
  ],
  ESTUDIANTE: [
    "grades.own.read", "tasks.own.read", "attendance.own.read",
    "bulletins.own.read", "materials.read", "chatbot.use",
  ],
  PADRE: [
    "children.grades.read", "children.attendance.read",
    "children.tasks.read", "children.bulletins.read",
    "messages.teachers.send",
  ],
};

export const hasPermission = (role, permission) => {
  return permissions[role]?.includes(permission) ?? false;
};
