# Documentación de Roles del Sistema Académico

## 📋 Tabla de Contenidos
1. [Visión General del Sistema](#visión-general-del-sistema)
2. [Jerarquía de Roles](#jerarquía-de-roles)
3. [Descripción Detallada por Rol](#descripción-detallada-por-rol)
4. [Permisos y Restricciones](#permisos-y-restricciones)
5. [Flujo de Trabajo por Rol](#flujo-de-trabajo-por-rol)

---

## 🌍 Visión General del Sistema

El Sistema Académico Multi-Institución está diseñado para gestionar múltiples instituciones educativas con diferentes roles y niveles de acceso. Cada rol tiene responsabilidades específicas y limitaciones claras para mantener la integridad y seguridad de los datos.

---

## 🏗️ Jerarquía de Roles

```
SUPER_ADMIN
├── ADMIN_INSTITUCIONAL
    ├── COORDINADOR
    ├── PSICOORIENTADOR
    ├── SECRETARIA
    ├── DIRECTOR_GRUPO
    └── DOCENTE
        └── ESTUDIANTE
            └── PADRE (acceso limitado)
```

---

## 👤 Descripción Detallada por Rol

### 1. SUPER_ADMIN (Super Administrador)
**Usuario Ejemplo:** Carlos Mendoza

#### ✅ **Qué HACE:**
- **Gestión Global:** Administra todas las instituciones educativas del sistema
- **Control de Licencias:** Gestiona licencias premium y básicas de cada institución
- **Monitoreo del Sistema:** Supervisa el rendimiento global, backups y estado del servidor
- **Creación de Instituciones:** Autoriza y crea nuevas instituciones en la plataforma
- **Soporte Técnico:** Proporciona soporte de alto nivel a administradores institucionales
- **Reportes Globales:** Genera reportes consolidados de todas las instituciones
- **Gestión de Usuarios:** Puede crear, modificar o eliminar cualquier tipo de usuario

#### ❌ **Qué NO HACE:**
- No gestiona operaciones diarias de instituciones específicas
- No ve datos académicos detallados de estudiantes individuales
- No administra calificaciones o asistencia
- No gestiona documentación de estudiantes o docentes

---

### 2. ADMIN_INSTITUCIONAL (Administrador Institucional)
**Usuario Ejemplo:** María González

#### ✅ **Qué HACE:**
- **Gestión Institucional:** Administra su institución específica (IE Rural El Progreso)
- **Control de Usuarios:** Crea y gestiona docentes, directores, coordinadores y secretarias
- **Configuración Académica:** Define períodos académicos, cursos y materias
- **Reportes Institucionales:** Genera reportes de rendimiento, asistencia y estadísticas
- **Matrículas:** Gestiona procesos de matrícula y admisión de estudiantes
- **Comunicaciones:** Envía comunicados institucionales masivos
- **Validación Documental:** Aprueba documentación de docentes y estudiantes
- **Aprobación Final:** Autoriza boletines aprobados por dirección para distribución

#### ❌ **Qué NO HACE:**
- No puede calificar estudiantes
- No puede modificar notas existentes
- No gestiona otras instituciones
- No tiene acceso a configuraciones del sistema global

#### 🔄 **Proceso de Boletines:**
1. **Supervisión Final:** Recibe boletines aprobados por dirección
2. **Autorización Institucional:** Da aprobación final como máxima autoridad
3. **Control de Calidad:** Verifica que todos los procesos se cumplieron
4. **Validación de Distribución:** Autoriza la entrega a estudiantes y padres

---

### 3. COORDINADOR (Coordinador Académico)
**Usuario Ejemplo:** Pedro Ramírez

#### ✅ **Qué HACE:**
- **Supervisión Académica:** Monitorea el rendimiento general de todos los cursos
- **Gestión de Cambios de Nota:** Aprueba o rechaza solicitudes de corrección de notas
- **Planes de Mejora:** Diseña y supervisa planes de mejora para estudiantes en riesgo
- **Indicadores Académicos:** Analiza indicadores por curso y materia
- **Alertas Tempranas:** Identifica estudiantes con bajo rendimiento o problemas
- **Coordinación Docente:** Facilita la comunicación entre docentes
- **Reportes de Desempeño:** Genera reportes académicos para directivos
- **Revisión de Boletines:** Valida y aprueba boletines generados por Secretaría
- **Control de Calidad:** Asegura que los boletines cumplan con normativas académicas
- **Validación Final:** Aprueba boletines para distribución institucional

#### ❌ **Qué NO HACE:**
- No puede asignar calificaciones directamente
- No gestiona aspectos administrativos (pagos, matrículas)
- No modifica datos personales de estudiantes
- No tiene acceso a configuraciones del sistema
- No genera boletines directamente (solo revisión y aprobación)

#### 🔄 **Proceso de Boletines:**
1. **Recepción:** Recibe boletines de Secretaría para revisión académica
2. **Validación:** Verifica información, promedios y cumplimiento normativo
3. **Aprobación:** Aprueba o solicita correcciones si hay inconsistencias
4. **Envío a Dirección:** Presenta boletines aprobados para autorización final
5. **Seguimiento:** Monitorea el estado de cada boletín en el proceso

---

### 4. DOCENTE (Docente de Asignatura)
**Usuario Ejemplo:** Luis Herrera, Sandra López

#### ✅ **Qué HACE:**
- **Gestión de Materias:** Administra las materias asignadas (Matemáticas, Español, etc.)
- **Calificaciones:** Registra y actualiza notas de sus estudiantes
- **Asistencia:** Registra asistencia diaria de sus clases
- **Tareas y Actividades:** Crea, asigna y califica tareas y actividades
- **Seguimiento Estudiantil:** Monitorea el progreso individual de sus estudiantes
- **Comunicación con Padres:** Responde consultas de padres sobre rendimiento
- **Reportes por Materia:** Genera reportes de rendimiento por materia

#### ❌ **Qué NO HACE:**
- No puede ver datos de estudiantes de otros cursos (excepto los que imparte)
- No puede modificar notas de otras materias
- No tiene acceso a información financiera o administrativa
- No puede gestionar usuarios del sistema

---

### 5. DIRECTOR_GRUPO (Director de Grupo)
**Usuario Ejemplo:** Jorge Castro

#### ✅ **Qué HACE:**
- **Liderazgo de Curso:** Es el responsable principal de un curso específico (ej: 7A)
- **Seguimiento Integral:** Monitorea todas las materias de sus estudiantes
- **Comunicación Principal:** Es el punto de contacto principal para padres de su curso
- **Disciplina y Convivencia:** Gestiona situaciones disciplinarias y convivencia
- **Reportes por Curso:** Genera boletines y reportes completos de su curso
- **Coordinación con Docentes:** Facilita comunicación entre docentes de su curso
- **Seguimiento de Asistencia:** Monitorea patrones de asistencia general
- **Supervisión de Boletines:** Revisa y aprueba boletines de su curso antes de distribución

#### ❌ **Qué NO HACE:**
- No puede calificar directamente (solo supervisa)
- No puede modificar notas de materias específicas
- No gestiona aspectos administrativos de la institución
- No tiene acceso a datos de otros cursos
- No genera boletines directamente (solo supervisión y aprobación)

#### 🔄 **Proceso de Boletines:**
1. **Recepción:** Recibe boletines generados por Secretaría para revisión
2. **Validación:** Verifica información de estudiantes y notas de su curso
3. **Aprobación:** Aprueba boletines correctos para distribución
4. **Seguimiento:** Monitorea el estado de cada boletín del curso

---

### 6. PSICOORIENTADOR (Psicorientador)
**Usuario Ejemplo:** Claudia Ríos

#### ✅ **Qué HACE:**
- **Orientación Estudiantil:** Brinda apoyo psicológico y orientación vocacional
- **Detección Temprana:** Identifica problemas emocionales o de conducta
- **Intervenciones:** Diseña y ejecuta planes de intervención
- **Coordinación con Padres:** Comunica situaciones especiales con padres
- **Apoyo a Docentes:** Asesoría a docentes en manejo de situaciones especiales
- **Reportes de Seguimiento:** Documenta intervenciones y progresos
- **Programas Preventivos:** Desarrolla programas de prevención y bienestar

#### ❌ **Qué NO HACE:**
- No tiene acceso a calificaciones académicas
- No puede modificar datos administrativos
- No gestiona aspectos financieros
- No tiene acceso a configuraciones del sistema

---

### 7. SECRETARIA (Secretaría Académica)
**Usuario Ejemplo:** Ana Martínez

#### ✅ **Qué HACE:**
- **Matrículas:** Gestiona procesos de matrícula y admisión
- **Documentos:** Organiza y gestiona documentación estudiantil
- **Certificados:** Emite certificados de estudio, conducta, etc.
- **Listados:** Genera listados oficiales para diversos trámites
- **Comunicaciones:** Prepara comunicados institucionales
- **Archivo Central:** Mantiene expedientes de estudiantes
- **Boletines Académicos:** Elabora y gestiona boletines oficiales
- **Proceso de Aprobación:** Coordina flujo de aprobación con Coordinador y Dirección
- **Generación de PDFs:** Crea documentos oficiales con sellos y firmas
- **Control de Calidad:** Validación de información antes de distribución
- **Reportes:** Genera reportes administrativos y académicos

#### ❌ **Qué NO HACE:**
- No puede calificar estudiantes directamente
- No puede modificar notas existentes
- No aprueba boletines sin validación previa
- No distribuye boletines sin aprobación final
- No gestiona horarios o asignaciones académicas

#### 🔄 **Proceso de Boletines:**
1. **Generación:** Crea borradores masivos por período académico
2. **Envío a Coordinación:** Envía para revisión académica
3. **Recepción de Aprobación:** Recibe boletines validados por coordinador
4. **Envío a Dirección:** Presenta para aprobación institucional final
5. **Aprobación Final:** Recibe autorización de Dirección (Rector/Director)
6. **Distribución:** Genera PDFs oficiales para estudiantes y padres

---

### 8. ESTUDIANTE
**Usuario Ejemplo:** Juan Pérez, Sofía Torres

#### ✅ **Qué HACE:**
- **Consulta de Notas:** Visualiza sus calificaciones y promedios
- **Tareas:** Ve y entrega tareas asignadas
- **Asistencia:** Consulta su registro de asistencia
- **Materias:** Accede a información de sus materias
- **Comunicados:** Recibe comunicados importantes
- **Alertas:** Recibe alertas sobre tareas vencidas o situaciones especiales
- **Boletines:** Descarga sus boletines de calificaciones

#### ❌ **Qué NO HACE:**
- No puede modificar ninguna información
- No puede ver datos de otros estudiantes
- No tiene acceso a información administrativa
- No puede comunicarse directamente con otros estudiantes a través del sistema

---

### 9. PADRE (Acudiente)
**Usuario Ejemplo:** Roberto Pérez

#### ✅ **Qué HACE:**
- **Seguimiento Académico:** Consulta notas y rendimiento de sus hijos
- **Asistencia:** Monitorea la asistencia de sus hijos
- **Tareas:** Ve las tareas pendientes de sus hijos
- **Comunicación:** Recibe comunicados importantes de la institución
- **Alertas:** Recibe notificaciones sobre situaciones especiales
- **Reportes:** Accede a boletines y reportes de sus hijos
- **Solicitudes:** Puede solicitar información o reportar situaciones

#### ❌ **Qué NO HACE:**
- Solo puede ver información de sus hijos registrados
- No puede modificar ninguna información académica
- No tiene acceso a información administrativa

#### 🔄 **Proceso de Boletines:**
1. **Recepción:** Recibe boletines aprobados y distribuidos por la institución
2. **Consulta:** Visualiza notas de sus hijos matriculados
3. **Descarga:** Puede descargar PDFs oficiales para su archivo
4. **Seguimiento:** Monitorea el estado y proceso de cada boletín de sus hijos

- No puede comunicarse directamente con docentes a través del sistema

---

## 🔐 Permisos y Restricciones

### Niveles de Acceso por Módulo

| Módulo | Super Admin | Admin Inst. | Coordinador | Docente | Director | Psico | Secretaria | Estudiante | Padre |
|--------|-------------|-------------|-------------|---------|----------|-------|------------|------------|-------|
| **Usuarios** | ✅ Total | ✅ Institución | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Calificaciones** | ❌ | ❌ | ✅ Supervisión | ✅ Parcial | ✅ Completo | ❌ | ❌ | ✅ Propias | ✅ Hijos |
| **Asistencia** | ❌ | ✅ Global | ✅ Global | ✅ Clases | ✅ Curso | ❌ | ✅ Consulta | ✅ Propia | ✅ Hijos |
| **Reportes** | ✅ Global | ✅ Institución | ✅ Académicos | ✅ Materia | ✅ Curso | ✅ Seguimiento | ✅ Documental | ✅ Propios | ✅ Hijos |
| **Configuración** | ✅ Total | ✅ Institución | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🔄 Flujo de Trabajo por Rol

### Flujo Académico Típico
1. **ADMIN** configura períodos y cursos
2. **DOCENTES** registran notas y asistencia
3. **DIRECTORES** supervisan el progreso del curso
4. **COORDINADOR** analiza indicadores y aprueba cambios
5. **ESTUDIANTES** consultan su progreso
6. **PADRES** reciben notificaciones y seguimiento

### Flujo de Documentación
1. **ESTUDIANTE/DOCENTE** sube documentos
2. **SECRETARIA** valida y organiza documentación
3. **ADMIN** aprueba documentación crítica
4. **PSICOORIENTADOR** accede a documentos especiales

### Flujo de Alertas
1. **DOCENTE** detecta problema y genera alerta
2. **DIRECTOR** recibe alerta de su curso
3. **COORDINADOR** supervisa alertas académicas
4. **PSICOORIENTADOR** interviene si es necesario
5. **PADRE** recibe notificación si aplica

---

## 📞 Puntos de Contacto por Rol

- **Super Admin:** Soporte técnico y global del sistema
- **Admin Institucional:** Configuración y gestión institucional
- **Coordinador:** Asuntos académicos y rendimiento
- **Docente:** Consultas específicas de materias
- **Director:** Asuntos generales del curso
- **Psicoorientador:** Apoyo emocional y conductual
- **Secretaría:** Documentación y trámites administrativos
- **Estudiante:** Uso diario del sistema
- **Padre:** Seguimiento del progreso académico

---

*Esta documentación está basada en la estructura actual del sistema y puede actualizarse según evolucionen los requerimientos funcionales.*
