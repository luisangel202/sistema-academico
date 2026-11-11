# INFORME FINAL — ETAPA 3
## Sistema de Gestión Académica para las Instituciones Educativas Rurales del Municipio de Achí, Bolívar (EduRural)

**Universidad:** Corporación Universitaria Latinoamericana
**Programa:** Ingeniería de Sistemas y Computación
**Asignatura:** Proyecto II
**Autores:** Luis Gómez Meza — Daniel Meza
**Docente:** Luis Cardozo
**Fecha:** 17 de agosto de 2026

---

## 1. Título

**Diseño e implementación de una plataforma web de gestión académica para las instituciones educativas rurales del municipio de Achí, Bolívar**

---

## 2. Planteamiento del Problema

Achí es un municipio ribereño del departamento de Bolívar, ubicado en la subregión de la Depresión Momposina, sobre la margen izquierda del río Cauca. Su economía se basa en la agricultura, la ganadería y la pesca, y buena parte de su territorio solo es accesible por vía fluvial o por caminos veredales que se dificultan aún más en épocas de invierno. El municipio cuenta con varias instituciones y centros educativos con sedes dispersas en corregimientos y veredas —entre ellas las de Guacamayo, Río Nuevo, Los Nísperos, Santa Lucía, Playa Alta y la Institución Educativa Técnica Agropecuaria de Puerto Venecia—, encargadas de llevar la educación a las poblaciones más alejadas del casco urbano.

Estas sedes rurales enfrentan una brecha significativa en el acceso y uso de herramientas tecnológicas para la gestión académica. Mientras que las instituciones urbanas del departamento cuentan con algún tipo de sistema de administración escolar, las sedes rurales de Achí operan mayoritariamente con registros físicos, hojas de cálculo desconectadas entre sí y procesos manuales que dificultan el seguimiento oportuno del rendimiento estudiantil.

Esta situación genera múltiples problemáticas:

1. **Fragmentación de la información:** los datos académicos —notas, asistencia, comportamiento— se almacenan en registros separados por sede y sin integración, lo que impide un análisis centralizado del desempeño estudiantil en el municipio.

2. **Comunicación deficiente:** padres de familia y acudientes, muchos de ellos ubicados en corregimientos y veredas alejados del casco urbano, no reciben información oportuna sobre el progreso académico de sus hijos, reduciendo su participación en el proceso formativo.

3. **Carga administrativa excesiva:** los docentes, que en las sedes rurales suelen atender varios grados a la vez, destinan un tiempo considerable a tareas administrativas como el llenado de planillas, elaboración de boletines y registro de asistencia, restando tiempo pedagógico.

4. **Falta de indicadores para la toma de decisiones:** coordinadores y directivos de las instituciones educativas de Achí no cuentan con tableros de control que les permitan identificar, sede por sede, a los estudiantes en riesgo de reprobación o ausentismo de manera temprana.

5. **Limitaciones de conectividad:** las soluciones existentes en el mercado requieren conexión permanente a internet y no están optimizadas para un territorio como Achí, donde el acceso fluvial y la conectividad intermitente son la norma en buena parte de las sedes rurales.

6. **Costos inaccesibles:** plataformas comerciales como Q10, Academusoft y SchoolSoft atienden principalmente instituciones urbanas de estratos medios y altos, con costos mensuales que las hacen poco viables para instituciones oficiales rurales con presupuestos limitados como las de Achí.

El propio Ministerio de Educación Nacional ha reconocido las carencias de infraestructura educativa de la subregión: en 2020 incluyó a Achí entre los municipios de Bolívar beneficiados con inversión para mejoramiento de sedes educativas rurales (MEN, 2020), y la Secretaría de Educación Departamental ha señalado que la gran mayoría de las sedes del departamento son rurales y presentan un estado de infraestructura que va de regular a deficiente (Funcicar, 2024).

### Pregunta de Investigación

¿Cómo puede una plataforma web de gestión académica, diseñada específicamente para las instituciones educativas rurales del municipio de Achí, Bolívar, mejorar la eficiencia administrativa, la comunicación entre actores educativos y el seguimiento del rendimiento estudiantil?

---

## 3. Justificación

El desarrollo de EduRural responde a una necesidad concreta de las instituciones educativas rurales de Achí, Bolívar, sustentada en los siguientes argumentos:

### 3.1 Pertinencia Social

De acuerdo con cifras de la Secretaría de Educación Departamental de Bolívar, la gran mayoría de las sedes educativas del departamento son rurales, y una parte importante de su infraestructura se encuentra en estado regular o deficiente (Funcicar, 2024). Achí, como municipio de la Depresión Momposina, comparte estas condiciones: sus sedes rurales —dispersas en corregimientos como Guacamayo, Río Nuevo, Los Nísperos, Santa Lucía, Playa Alta y Puerto Venecia— carecen en su mayoría de sistemas digitales de gestión académica, perpetuando inequidades frente a las instituciones urbanas del departamento. A nivel global, la OCDE ha documentado que los sistemas de información académica bien implementados reducen la deserción escolar y mejoran la comunicación familia-escuela y la toma de decisiones directivas (OCDE, 2022). Una plataforma accesible y adaptada a las condiciones de un municipio ribereño como Achí —conectividad intermitente, sedes de difícil acceso, docentes multigrado— contribuye directamente a cerrar esta brecha digital educativa a escala local.

### 3.2 Pertinencia Técnica

Los avances en tecnologías web modernas —como React, Node.js y las Progressive Web Apps— permiten construir aplicaciones que funcionan con conectividad intermitente, son accesibles desde dispositivos móviles de gama media y no requieren instalaciones complejas. La literatura sobre patrones de desarrollo frontend señala que las arquitecturas SPA (Single Page Application) facilitan la curva de aprendizaje de usuarios no técnicos frente a aplicaciones web tradicionales (Hallie & Osmani, s.f.). Esto hace técnicamente viable una solución robusta para los contextos rurales de Achí.

### 3.3 Impacto en la Calidad Educativa

La literatura especializada señala que el seguimiento oportuno del desempeño estudiantil reduce significativamente las tasas de repitencia y deserción. Investigaciones en analítica de aprendizaje documentan mejoras en la predicción y prevención de la reprobación cuando los docentes tienen acceso a alertas tempranas automatizadas y a modelos ajustados al contexto del curso (Gašević et al., 2016). Al automatizar el registro y análisis de notas y asistencia, la plataforma libera tiempo docente para actividades pedagógicas y permite intervenciones tempranas ante señales de alerta académica.

### 3.4 Pertinencia Normativa

El sistema incorpora los requisitos específicos de la normativa colombiana: Ley 115 de 1994 (Ley General de Educación), Decreto 1075 de 2015 (Decreto Único Reglamentario del Sector Educación), Resolución 15683 de 2016 del MEN y Ley 1918 de 2018 (régimen de inhabilidades para quienes hayan sido condenados por delitos sexuales contra menores), aspecto que pocas soluciones del mercado incorporan.

### 3.5 Escalabilidad Multi-institucional

El diseño multi-tenant de la plataforma permite que una sola instancia del sistema sirva a múltiples sedes educativas del municipio, reduciendo costos de implementación y mantenimiento, lo cual es fundamental para instituciones con recursos limitados.

### 3.6 Brechas Identificadas en la Literatura

El análisis del estado del arte permite identificar cuatro vacíos concretos que justifican el presente trabajo:

1. **Ausencia de soluciones de bajo costo para el sector rural oficial colombiano:** las plataformas existentes no están diseñadas para las restricciones presupuestales y de conectividad del sector rural.
2. **Falta de integración multi-rol en un solo sistema:** la mayoría de soluciones disponibles privilegian la perspectiva docente o administrativa, sin integrar de manera coherente a todos los actores del proceso educativo.
3. **Desconexión entre gestión documental y gestión académica:** los sistemas existentes tratan estos procesos como módulos separados, generando duplicidad y dificultades de trazabilidad.
4. **Escasa atención al cumplimiento normativo colombiano:** pocos sistemas incorporan los requisitos específicos de la normativa nacional (Ley 1918 de 2018, Decreto 1075 de 2015, escalafón docente).

---

## 4. Objetivos

### 4.1 Objetivo General

Diseñar e implementar una plataforma web de gestión académica multi-institucional, con roles diferenciados y herramientas de análisis, que mejore los procesos administrativos y pedagógicos de las instituciones educativas rurales del municipio de Achí, Bolívar.

### 4.2 Objetivos Específicos

1. Desarrollar un módulo de gestión de usuarios con nueve roles diferenciados —Super Administrador, Administrador Institucional, Coordinador, Secretaria, Docente, Director de Grupo, Psicoorientador, Estudiante y Padre de Familia—, garantizando el control de acceso basado en roles (RBAC) con menús y módulos diferenciados por perfil.

2. Implementar un sistema de registro y seguimiento académico que permita a los docentes registrar calificaciones por actividad con categorías y pesos ponderados configurables, controlar la asistencia diaria y publicar tareas con fechas límite y criterios de evaluación.

3. Construir un módulo de gestión documental que incorpore el catálogo normativo colombiano completo por rol —según Decreto 1075/2015, Ley 1918/2018 y normativa del escalafón docente— con control de estados, carga real de archivos y casilla de exención.

4. Diseñar dashboards diferenciados por rol con indicadores clave de rendimiento, visualizaciones de datos mediante gráficas de área, barras y radar, y sistema de alertas tempranas para identificación de estudiantes en riesgo.

5. Construir un módulo de comunicación institucional que incluya mensajería interna entre roles, sistema de alertas académicas con niveles de severidad, citaciones a padres de familia, observador del estudiante y reuniones académicas.

6. Garantizar la accesibilidad y usabilidad de la plataforma en dispositivos con capacidades limitadas, implementando diseño responsive completo, sidebar como drawer en móvil y tablas con scroll horizontal controlado.

---

## 5. Alcance

### 5.1 Delimitación del Proyecto

El presente proyecto desarrolla un prototipo funcional de sistema de gestión académica web denominado EduRural, orientado a las instituciones y centros educativos públicos rurales del municipio de Achí, Bolívar, incluyendo sus sedes dispersas en corregimientos y veredas. El sistema está implementado como una aplicación de página única (SPA) con React 18, Tailwind CSS v4 y datos simulados (mockData), estructurado para su posterior integración con un backend real y su despliegue como aplicación multi-sede accesible desde el casco urbano y las sedes rurales del municipio.

### 5.2 Lo que el Proyecto Logra

**En gestión de usuarios y roles:**
- Implementación completa de 9 roles diferenciados con menús y rutas propias.
- Control de acceso basado en roles (RBAC).
- Gestión de fotografías de perfil y logos institucionales mediante ImageContext.

**En gestión académica:**
- Registro de notas por actividades con 8 categorías y pesos porcentuales configurables.
- Cálculo automático de promedios ponderados: Σ(nota_i × peso_i) / Σ(peso_i).
- Gestión de asistencia diaria con estados múltiples.
- Generación de boletines académicos con exportación a PDF.
- Gestión de tareas con seguimiento de entregas.

**En gestión administrativa:**
- Módulo de matrículas con asignación de estudiantes a cursos.
- Módulo de documentos con catálogo normativo colombiano, carga real de archivos y casilla de exención.
- Generación de certificados y listados.
- Gestión de períodos académicos, cursos, materias y asignaciones.
- Módulo de instituciones con gestión multi-tenant y carga de logos.

**En comunicación:**
- Sistema de mensajería interna entre roles.
- Módulo de alertas académicas con niveles de severidad y filtros.
- Citaciones a padres con estados y registro de resultado.
- Observador del estudiante con visibilidad configurable.
- Reuniones académicas.

**En supervisión y control:**
- Dashboards diferenciados por rol con gráficas Recharts.
- Módulo de auditoría de acciones con filtros avanzados.
- Planes de mejoramiento académico.
- Flujo de solicitud y aprobación de cambios de nota.
- Módulo de psicoorientación con gestión de casos y citas.

### 5.3 Indicadores Cuantitativos del Sistema

| Indicador | Valor |
|---|---|
| Archivos de componentes y páginas desarrollados | 57 |
| Roles de usuario diferenciados | 9 |
| Módulos funcionales implementados | 40+ |
| Módulos con sistema de filtros | Todos |
| Pasos en el flujo de recuperación de contraseña | 3 |
| Categorías de actividades de evaluación | 8 |

### 5.4 Lo que el Proyecto No Incluye

- Integración con backend real o base de datos persistente (datos en memoria durante la sesión).
- Integración con SIMAT u otros sistemas del MEN.
- Módulo de nómina o gestión financiera.
- Aplicación móvil nativa.
- Módulo de videoconferencia integrado.
- Firma digital de documentos.
- Funcionalidad offline mediante Service Workers (planificada para versiones futuras).

---

## 6. Metodología

### 6.1 Enfoque Metodológico

El proyecto adopta una metodología de desarrollo ágil incremental basada en los principios del Manifiesto Ágil, combinada con técnicas de Diseño Centrado en el Usuario (DCU). Este enfoque permite iterar sobre los módulos del sistema incorporando retroalimentación continua, priorizando la funcionalidad sobre la documentación exhaustiva y respondiendo al cambio sobre seguir un plan rígido.

La aplicación del modelo RBAC como estándar de control de acceso sigue las especificaciones del NIST SP 800-162 (NIST, 2020) y los fundamentos teóricos de Ferraiolo et al. (2001). El diseño de interfaces aplica principios de usabilidad del Nielsen Norman Group (2021) y de Diseño Atómico (Frost, 2016) para la construcción de componentes reutilizables.

### 6.2 Fases del Desarrollo

#### Fase 1 — Análisis y Diseño del Sistema (Semanas 1–2)

**Objetivo específico:** definir la arquitectura del sistema, los roles de usuario y los módulos funcionales requeridos.

**Actividades:**
- Revisión de normativa colombiana aplicable (Ley 115/94, Decreto 1075/2015, Ley 1918/2018, Resolución 15683/2016).
- Identificación de actores del sistema y análisis de roles institucionales.
- Definición de la arquitectura de componentes React y estructura de datos.
- Diseño del sistema de permisos RBAC con matriz de 9 roles × N permisos.
- Prototipado de wireframes de las interfaces principales.

**Entregables:** diagrama de arquitectura, modelo de datos, matriz de permisos, wireframes.

#### Fase 2 — Desarrollo del Núcleo del Sistema (Semanas 3–5)

**Objetivo específico:** implementar la infraestructura base del sistema.

**Actividades:**
- Configuración del proyecto con Vite + React 18 + Tailwind CSS v4.
- Implementación del AuthContext con soporte para 9 roles e ImageContext para gestión de fotografías.
- Desarrollo del layout principal responsive (Sidebar como drawer en móvil, Header con glassmorphism, MainLayout con margen dinámico).
- Creación del design system: Modal, Badge, StatCard, PageHeader, ModuleLayout, ImageUploader.
- Implementación del sistema de rutas protegidas por rol.
- Módulo de Login con flujo de recuperación de contraseña en 3 pasos e indicador de fortaleza.

**Entregables:** sistema base funcional con autenticación y navegación por roles.

#### Fase 3 — Desarrollo de Módulos Académicos (Semanas 6–9)

**Objetivo específico:** implementar los módulos centrales del proceso académico.

**Actividades:**
- **Notas:** actividades configurables con 8 categorías y pesos, promedio ponderado en tiempo real, tabla dinámica con columna sticky.
- **Asistencia:** registro diario con estados múltiples, estadísticas en tiempo real.
- **Tareas:** creación, asignación y seguimiento de entregas con validación de fechas.
- **Materiales:** carga real de archivos con drag & drop, validación de tamaño y tipo.
- **Boletines:** visualización de notas por período con exportación PDF (jsPDF + html2canvas).
- **Dashboards:** diferenciados para cada rol con gráficas Recharts (AreaChart, BarChart, RadarChart, PieChart).

**Entregables:** módulos académicos funcionales con datos simulados.

#### Fase 4 — Desarrollo de Módulos Administrativos (Semanas 10–12)

**Objetivo específico:** implementar los módulos de gestión administrativa y documental.

**Actividades:**
- **Usuarios:** CRUD completo con filtros, carga de fotografías, validación con useFormValidation.
- **Matrículas:** registro de estudiantes en cursos con acudiente.
- **Documentos:** catálogo normativo colombiano por rol, estados (entregado/pendiente/vencido/exento), carga real de archivos, casilla de exención.
- **Certificados y listados:** generación de constancias académicas.
- **Instituciones:** gestión multi-institución con carga de logos.
- **Cursos, Materias, Períodos y Asignaciones:** módulos de configuración académica.

**Entregables:** módulos administrativos funcionales.

#### Fase 5 — Módulos de Comunicación y Supervisión (Semanas 13–14)

**Objetivo específico:** implementar los módulos de comunicación entre actores y supervisión académica.

**Actividades:**
- **Mensajes:** chat interno responsive con layout adaptativo.
- **Alertas:** niveles de severidad (alto/medio/informativo) con filtros y marcado de leídas.
- **Citaciones:** gestión con estados, registro de resultado y validación de fechas futuras.
- **Observador:** observaciones con tipos y visibilidad configurable.
- **Reuniones:** programación y seguimiento de reuniones académicas.
- **Planes de Mejoramiento:** CRUD con validación, seguimiento y marcar completado.
- **Cambios de Nota:** flujo de solicitud, revisión y aprobación/rechazo.
- **Auditoría:** registro de acciones con filtros por usuario, acción, IP y rango de fechas.

**Entregables:** módulos de comunicación y supervisión funcionales.

#### Fase 6 — Refinamiento de UI/UX y Responsividad (Semanas 15–16)

**Objetivo específico:** garantizar diseño profesional, responsividad completa y consistencia visual.

**Actividades:**
- Rediseño del sistema de componentes base con tokens de diseño consistentes.
- Implementación de `ModuleLayout` como estructura estándar para todos los módulos.
- Corrección de textos montados sobre íconos en todos los contenedores.
- Tablas con scroll horizontal controlado y columnas responsive.
- Rediseño del Login con proporciones correctas y espaciado uniforme.
- Mejora de dashboards con gráficas, KPIs y alertas tempranas.
- Pruebas de responsividad en móvil, tablet y escritorio.

**Entregables:** sistema con diseño profesional, responsive completo y módulos sin problemas de layout.

### 6.3 Arquitectura del Sistema

El sistema EduRural implementa una arquitectura SPA con los siguientes patrones:

**Patrón de Contexto:** dos contextos globales: `AuthContext` (autenticación, login/logout, recuperación de contraseña) e `ImageContext` (fotografías de perfil y logos institucionales con actualización en tiempo real).

**Atomic Design:** tres niveles de componentes:
- *Átomos:* Badge, StatCard, Toggle, PasswordToggle
- *Moléculas:* PageHeader, Modal, Toast, ModuleLayout, FilterInput, FilterSelect, FormField
- *Organismos:* Sidebar, Header, MainLayout, DataTable

**RBAC:** 9 roles con menús y rutas diferenciadas. El MainLayout verifica autenticación y redirige al login si no hay sesión activa.

### 6.4 Herramientas y Tecnologías Utilizadas

| Categoría | Herramienta | Versión | Justificación |
|---|---|---|---|
| Framework UI | React | 18.x | Ecosistema maduro, componentes reutilizables, Context API |
| Build Tool | Vite | 8.x | Compilación ultrarrápida, HMR eficiente |
| Estilos | Tailwind CSS | 4.x | Utility-first, responsive sin CSS extenso |
| Iconografía | Lucide React | Latest | Librería ligera, 1000+ íconos SVG consistentes |
| Gráficas | Recharts | Latest | Integración nativa con React, responsive |
| Enrutamiento | React Router | 7.x | Estándar de facto para SPA en React |
| Generación PDF | jsPDF + html2canvas | Latest | Exportación de boletines sin backend |
| Control de versiones | Git | — | Trazabilidad de cambios |

---

## 7. Cronograma

El cronograma se divide en dos etapas. La **Etapa 1** cubre el desarrollo del prototipo funcional frontend (fases 1–6, ya completadas). La **Etapa 2**, comprendida entre el **24 de agosto y el 25 de noviembre de 2026** (14 semanas), cubre todo lo necesario para convertir el prototipo en una aplicación web real, desplegada en internet y disponible para las instituciones educativas rurales de Achí, Bolívar.

---

### Etapa 1 — Prototipo Frontend (Completada)

| Semanas | Fase | Logros alcanzados |
|---|---|---|
| 1 – 2 | Análisis y Diseño | Arquitectura, modelo de datos, matriz de permisos RBAC, wireframes |
| 3 – 5 | Núcleo del Sistema | AuthContext, ImageContext, layout responsive, design system, Login con recuperación de contraseña |
| 6 – 9 | Módulos Académicos | Notas con pesos ponderados, Asistencia, Tareas, Materiales con drag & drop, Boletines PDF, Dashboards por rol |
| 10 – 12 | Módulos Administrativos | Usuarios, Cursos, Materias, Períodos, Documentos normativos, Instituciones multi-tenant |
| 13 – 14 | Comunicación y Supervisión | Mensajes, Alertas, Citaciones, Observador, Reuniones, Planes de Mejoramiento, Auditoría |
| 15 – 16 | Refinamiento UI/UX | Design system unificado, responsividad completa, corrección de layout en todos los módulos |

**Estado al inicio de la Etapa 2:** 57 archivos, 9 roles, 40+ módulos funcionales con datos simulados. La aplicación corre localmente con `npm run dev`.

---

### Etapa 2 — Hacia una Aplicación Web Real (24 ago – 25 nov 2026)

Esta etapa aborda los bloques que le faltan al sistema para funcionar como una página de internet real, usable por los nueve roles de las instituciones educativas de Achí: corrección de bugs pendientes, diseño y construcción del backend con base de datos real, despliegue en producción, configuración de dominio y seguridad, pruebas con usuarios reales y documentación de cierre.

| Semana | Fechas | Bloque | Actividades y Entregables |
|---|---|---|---|
| **1 – 2** | 24 ago – 5 sep | **Corrección de bugs frontend** | Corregir colisión de ruta `/mensajes` (estudiante vs. compartida) · Reemplazar `docenteId === 5` y `estudianteId === 9` hardcodeados por `user.id` dinámico en Asistencia, MisCursos y Chatbot · Conectar formulario de cambio de contraseña con `AuthContext.resetPassword()` · Agregar guardias de ruta por rol e implementar Error Boundary global · **Entregable:** frontend estable, todos los roles verificados sin datos incorrectos |
| **3** | 7 – 12 sep | **Diseño del backend** | Diseño definitivo de la API REST: endpoints, verbos HTTP y estructura de respuestas JSON · Diagrama entidad-relación (instituciones, usuarios, cursos, materias, períodos, notas, asistencia, tareas, documentos) · Esquemas de validación con Zod o Joi · Configuración del entorno: Node.js + Express + MongoDB Atlas · **Entregable:** API diseñada y entorno de desarrollo listo |
| **4** | 14 – 19 sep | **Backend — Autenticación y sesiones** | Registro y login con JWT (access token + refresh token) · Middleware de autenticación y autorización por rol · Hash de contraseñas con bcrypt · Recuperación de contraseña con código temporal de 6 dígitos · Integrar autenticación en el frontend reemplazando mockData de credenciales · **Entregable:** login y sesiones persistentes funcionando con base de datos real |
| **5** | 21 – 26 sep | **Backend — Usuarios e Instituciones** | CRUD completo de instituciones (identificación, ubicación, contacto, rector) · CRUD de usuarios con roles, estado activo/inactivo y validaciones · Carga de fotografías de perfil y logos institucionales con Cloudinary · Pruebas con Postman · **Entregable:** gestión de usuarios e instituciones con datos reales |
| **6 – 7** | 28 sep – 10 oct | **Backend — Módulos académicos** | Endpoints de cursos, materias, períodos y asignaciones · CRUD de notas con promedio ponderado calculado en el servidor · Registro y consulta de asistencia por curso y fecha · Tareas y entregas · Boletines con datos reales desde la base de datos · Integración frontend-backend de estos módulos · **Entregable:** ciclo académico completo funcionando con datos reales |
| **8** | 12 – 17 oct | **Backend — Módulos administrativos** | Matrículas: asignar estudiantes a cursos con acudiente · Documentos: guardar estado y archivo subido por usuario y tipo · Certificados y listados con generación dinámica · Auditoría real de acciones registrada en base de datos · **Entregable:** gestión administrativa con persistencia real |
| **9** | 19 – 24 oct | **Backend — Comunicación y supervisión** | Endpoints de mensajes internos entre roles · Alertas con persistencia y marcado de leídas · Citaciones, observador y reuniones con datos reales · Planes de mejoramiento y cambios de nota persistentes · Polling para notificaciones en tiempo real · **Entregable:** comunicación y supervisión con datos persistentes |
| **10** | 26 – 31 oct | **Despliegue en producción** | Subir repositorio a GitHub (frontend + backend) · Frontend en Vercel con `vercel.json` configurado para SPA routing · Backend en Railway con variables de entorno de producción · Base de datos en MongoDB Atlas · Verificar todas las rutas y endpoints en producción · **Entregable:** aplicación accesible desde una URL pública |
| **11** | 2 – 7 nov | **Dominio y seguridad** | Registrar dominio propio (`.com.co` o `.co`) y conectarlo en Vercel · HTTPS automático con SSL · Rate limiting y CORS en el backend · Sanitización de entradas contra XSS e inyección · Headers de seguridad con Helmet.js · **Entregable:** aplicación en dominio propio con HTTPS y seguridad básica |
| **12** | 9 – 14 nov | **Pruebas de usuario y rendimiento** | Pruebas funcionales con los 9 roles: verificar que cada rol accede únicamente a lo que le corresponde · Pruebas en dispositivos móviles y tablets (contexto rural) · Lazy loading de módulos con `React.lazy`, paginación en tablas grandes · Corrección de errores encontrados · **Entregable:** informe de pruebas con correcciones aplicadas |
| **13** | 16 – 21 nov | **Documentación final** | Documentar la API con Swagger o colección de Postman · Manual de usuario por rol con capturas de pantalla · README actualizado en GitHub con instrucciones de instalación · Video demo mostrando los flujos principales de cada rol · **Entregable:** documentación técnica y de usuario completa |
| **14** | 23 – 25 nov | **Cierre y presentación** | Revisión final de la aplicación en producción · Corrección de últimos detalles · Preparar presentación (diapositivas + demo en vivo) · Verificar que el dominio, HTTPS y todos los módulos estén operativos · **Entregable:** presentación final y aplicación web publicada y funcional en internet |

---

### Hitos Principales — Etapa 2

| # | Hito | Entregable | Fecha |
|---|---|---|---|
| H1 | Frontend sin bugs y con guardias de rol | Sistema sin hardcoding, rutas sin colisiones, acceso por rol funcionando | 5 sep |
| H2 | Backend de autenticación operativo | Login con JWT, contraseñas cifradas con bcrypt, sesiones persistentes | 19 sep |
| H3 | Usuarios e instituciones con BD real | CRUD persistente con imágenes en Cloudinary | 26 sep |
| H4 | Módulos académicos backend completos | Notas, asistencia, tareas y boletines con datos reales | 10 oct |
| H5 | Módulos administrativos backend completos | Matrículas, documentos y auditoría conectados a la base de datos | 17 oct |
| H6 | Módulos de comunicación backend completos | Mensajes, alertas, citaciones y planes persistentes | 24 oct |
| H7 | Aplicación desplegada con URL pública | Frontend en Vercel, backend en Railway, BD en MongoDB Atlas | 31 oct |
| H8 | Dominio propio con HTTPS y seguridad | Dominio operativo, CORS, rate limiting y headers de seguridad activos | 7 nov |
| **H9** | **Aplicación en producción, documentada y presentada** | **Sistema completo, probado, documentado y presentado** | **25 nov** |

---

### Stack Tecnológico — Etapa 2

| Capa | Tecnología | Costo estimado |
|---|---|---|
| Frontend hosting | Vercel | Gratis |
| Backend | Node.js + Express | — |
| Backend hosting | Railway o Render | Gratis (hasta cierto uso) |
| Base de datos | MongoDB Atlas | Gratis (512 MB) |
| Almacenamiento de archivos | Cloudinary | Gratis (25 GB) |
| Dominio `.com.co` | GoDaddy o Namecheap | ~$15 USD/año |
| SSL / HTTPS | Incluido en Vercel y Railway | Gratis |
| Validación de esquemas | Zod o Joi | Gratis (open source) |
| Seguridad HTTP | Helmet.js | Gratis (open source) |
| **Total estimado** | | **~$15 USD/año** |

---

## 8. Referencias
*(Formato APA, 7.ª edición)*

---

### Normativa y Política Educativa Colombiana

Colombia, Congreso de la República. (1994). *Ley 115 de 1994: Ley General de Educación*. Diario Oficial N.° 41.214. https://www.mineducacion.gov.co/1621/articles-85906_archivo_pdf.pdf

Colombia, Ministerio de Educación Nacional. (2015). *Decreto 1075 de 2015: Decreto Único Reglamentario del Sector Educación*. Diario Oficial N.° 49.523. https://www.mineducacion.gov.co/portal/normativa/Decretos/351080:Decreto-1075-de-Mayo-26-de-2015

Colombia, Ministerio de Educación Nacional. (2016). *Resolución 15683 de 2016: Lineamientos para el registro de información académica*. https://www.mineducacion.gov.co

Colombia, Congreso de la República. (2018). *Ley 1918 de 2018: Por medio de la cual se establece el régimen de inhabilidades a quienes hayan sido condenados por delitos sexuales cometidos contra menores*. Diario Oficial N.° 50.673. https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=87755

---

### Contexto Local: Municipio de Achí, Bolívar

Alcaldía de Achí, Bolívar. (s.f.). *Plan de desarrollo municipal: diagnóstico de educación, cultura y deporte*. https://repositoriocdim.esap.edu.co/bitstreams/8ee4d5aa-e2d3-4056-b058-452845d44767/download

Funcicar. (2024). *El 47,6% de las aulas educativas de Bolívar está en estado regular y solo el 30% en buen estado: Secretaría de Educación*. https://funcicar.org/el-476-de-las-aulas-educativas-de-bolivar-esta-en-estado-regular-y-solo-el-30-en-buen-estado-sec-educacion/

Ministerio de Educación Nacional. (2020). *En equipo, el Gobierno Nacional y el Departamento de Bolívar trabajan para que niños, niñas y jóvenes tengan educación de calidad en las zonas urbanas y rurales*. https://www.mineducacion.gov.co/1759/w3-printer-391429.html

Wikipedia, colaboradores de. (2025). *Achí (Bolívar)*. Wikipedia, la enciclopedia libre. https://es.wikipedia.org/wiki/Ach%C3%AD_(Bol%C3%ADvar)

---

### Organismos Internacionales y Estadísticas

Departamento Administrativo Nacional de Estadística (DANE). (2022). *Encuesta de Calidad de Vida 2022: acceso a tecnologías de la información y comunicación en hogares rurales*. https://www.dane.gov.co/index.php/estadisticas-por-tema/salud/calidad-de-vida-ecv

Ministerio de Educación Nacional (MEN). (2023). *Informe de gestión del sector educativo 2022–2023: conectividad y digitalización en instituciones rurales*. https://www.mineducacion.gov.co

Organización para la Cooperación y el Desarrollo Económicos (OCDE). (2022). *Education at a glance 2022: OECD indicators*. OECD Publishing. https://doi.org/10.1787/3197152b-en

Organización de las Naciones Unidas para la Educación, la Ciencia y la Cultura (UNESCO). (2023). *Technology in education: A tool on whose terms? Global Education Monitoring Report 2023*. UNESCO Publishing. https://doi.org/10.54676/UZQV8501

---

### Sistemas de Gestión Académica y Analítica de Aprendizaje

Gašević, D., Dawson, S., Rogers, T., & Gasevic, D. (2016). Learning analytics should not promote one size fits all: The effects of instructional conditions in predicting academic success. *The Internet and Higher Education*, *28*, 68–84. https://doi.org/10.1016/j.iheduc.2015.10.002

Siemens, G., Gašević, D., & Dawson, S. (2015). *Preparing for the digital university: A review of the history and current state of distance, blended, and online learning*. Athabasca University. https://linkresearchlab.org/PreparingDigitalUniversity.pdf

Watson, W. R., & Sottilare, R. A. (2012). Adaptive instructional systems. En R. A. Reiser & J. V. Dempsey (Eds.), *Trends and issues in instructional design and technology* (3.ª ed., pp. 246–260). Pearson.

---

### Educación Rural en Colombia

Colbert, V., & Arboleda, J. (2016). Bringing a student-centered participatory pedagogy to scale in Colombia. *Journal of Educational Change*, *17*(4), 385–410. https://doi.org/10.1007/s10833-016-9283-7

---

### Ingeniería de Software y Desarrollo Web

Ferraiolo, D. F., Sandhu, R., Gavrila, S., Kuhn, D. R., & Chandramouli, R. (2001). Proposed NIST standard for role-based access control. *ACM Transactions on Information and System Security*, *4*(3), 224–274. https://doi.org/10.1145/501978.501980

Frost, B. (2016). *Atomic design*. Brad Frost Web. https://atomicdesign.bradfrost.com

Hallie, L., & Osmani, A. (s.f.). *Learning patterns: Design, performance and rendering patterns for modern web applications* [libro digital]. Leanpub. https://leanpub.com/learningpatterns

National Institute of Standards and Technology (NIST). (2020). *Role-based access control (RBAC): NIST SP 800-162*. U.S. Department of Commerce. https://doi.org/10.6028/NIST.SP.800-162

---

### Usabilidad y Diseño Centrado en el Usuario

Nielsen Norman Group. (2021). *UX research methods: When to use which user-experience research methods*. https://www.nngroup.com/articles/which-ux-research-methods/

Preece, J., Rogers, Y., & Sharp, H. (2019). *Interaction design: Beyond human-computer interaction* (5.ª ed.). Wiley.

---

### Tecnologías Utilizadas en el Proyecto

Lucide Contributors. (2023). *Lucide: Beautiful & consistent icon toolkit* [software]. https://lucide.dev

Meta Open Source. (2023). *React: A JavaScript library for building user interfaces* (v18.x) [software]. https://react.dev

Recharts. (2023). *Recharts: A composable charting library built on React components* [software]. https://recharts.org

Tailwind Labs. (2023). *Tailwind CSS: A utility-first CSS framework* (v4.x) [software]. https://tailwindcss.com

Vitejs. (2023). *Vite: Next generation frontend tooling* (v8.x) [software]. https://vitejs.dev

---

> **Nota de verificación bibliográfica:** Se contrastaron todas las referencias contra fuentes primarias. Los principales ajustes aplicados respecto al informe original fueron: (1) la referencia de Gašević et al. se corrigió — el año es 2016, no 2019, y los autores incluyen a Rogers, T.; (2) la referencia de Osmani (2022, O'Reilly) se reemplazó por la fuente real: Hallie & Osmani (s.f.), libro digital autopublicado en Leanpub; (3) se incorporaron cuatro fuentes locales sobre Achí y Bolívar verificadas en línea (Alcaldía de Achí, Funcicar, MEN 2020, Wikipedia); (4) las referencias de Fedesarrollo (2022) y SoLAR (2022) no se incluyeron por no haber podido verificar los documentos específicos citados — se recomienda confirmar la fuente exacta antes de la entrega formal.
>
> Para las fuentes normativas colombianas se recomienda verificar la versión vigente en el Sistema Único de Información Normativa (SUIN-Juriscol): https://www.suin-juriscol.gov.co

---

*Documento elaborado como parte del proyecto de grado — Sistema EduRural — Corporación Universitaria Latinoamericana, 2026*
