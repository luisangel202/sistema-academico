# Diseño Tecnológico y Arquitectura - Sistema de Gestión Académica Multi-Institucional

## 1. Introducción

Este documento presenta el diseño tecnológico y arquitectónico detallado del Sistema de Gestión Académica Multi-Institucional, describiendo la estructura del sistema, componentes, patrones de diseño, y decisiones arquitectónicas.

## 2. Arquitectura General del Sistema

### 2.1 Visión Arquitectónica de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Web Browser │  │  Mobile App  │  │  Desktop App │          │
│  │  (React SPA) │  │  (React Native)│ │  (Electron)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React.js + TypeScript + TailwindCSS + Redux Toolkit    │   │
│  │  - Component Library (shadcn/ui)                        │   │
│  │  - State Management (Redux)                             │   │
│  │  - Routing (React Router)                               │   │
│  │  - Forms (React Hook Form)                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ REST API
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Gateway (Kong / AWS API Gateway)                    │   │
│  │  - Rate Limiting                                         │   │
│  │  - Authentication (JWT)                                  │   │
│  │  - Authorization (RBAC)                                  │   │
│  │  - Request Routing                                       │   │
│  │  - Logging & Monitoring                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      MICROSERVICES LAYER                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │   Auth     │ │Institution │ │  Academic  │ │  Document  │  │
│  │  Service   │ │  Service   │ │  Service   │ │  Service   │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                 │
│  │  Comm      │ │  Report    │ │  Notification│              │
│  │  Service   │ │  Service   │ │  Service    │              │
│  └────────────┘ └────────────┘ └────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      MESSAGE BROKER LAYER                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  RabbitMQ / AWS SQS                                      │   │
│  │  - Event Bus                                            │   │
│  │  - Message Queues                                        │   │
│  │  - Dead Letter Queues                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ PostgreSQL   │  │  MongoDB     │  │    Redis     │         │
│  │ (Relacional) │  │ (Documentos) │  │   (Caché)    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐                                              │
│  │  AWS S3      │                                              │
│  │ (Archivos)   │                                              │
│  └──────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AWS Cloud Services                                       │   │
│  │  - EC2 (Compute)                                         │   │
│  │  - RDS (Database)                                        │   │
│  │  - S3 (Storage)                                          │   │
│  │  - CloudFront (CDN)                                      │   │
│  │  - Route 53 (DNS)                                        │   │
│  │  - CloudWatch (Monitoring)                               │   │
│  │  - Docker + Kubernetes (Container Orchestration)          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Patrones Arquitectónicos Implementados

#### 2.2.1 Arquitectura de Microservicios

**Descripción:**
El sistema está dividido en servicios independientes que se comunican mediante APIs RESTful y eventos asíncronos.

**Beneficios:**
- **Escalabilidad independiente:** Cada servicio puede escalar según demanda
- **Desacoplamiento:** Fallos en un servicio no afectan otros
- **Despliegue continuo:** Actualizaciones sin downtime del sistema completo
- **Tecnologías heterogéneas:** Diferentes servicios pueden usar diferentes tecnologías

**Servicios Identificados:**

1. **Auth Service**
   - Responsabilidades: Autenticación, autorización, gestión de usuarios
   - Endpoints: `/auth/*`, `/users/*`
   - Base de datos: PostgreSQL (usuarios, roles, permisos)

2. **Institution Service**
   - Responsabilidades: Gestión de instituciones, configuración institucional
   - Endpoints: `/institutions/*`, `/config/*`
   - Base de datos: PostgreSQL (instituciones, sedes, jornadas)

3. **Academic Service**
   - Responsabilidades: Notas, asistencia, tareas, materiales
   - Endpoints: `/grades/*`, `/attendance/*`, `/assignments/*`, `/materials/*`
   - Base de datos: PostgreSQL (notas, asistencia, tareas)

4. **Document Service**
   - Responsabilidades: Boletines, certificados, constancias
   - Endpoints: `/documents/*`, `/bulletins/*`, `/certificates/*`
   - Base de datos: MongoDB (documentos, PDFs)

5. **Communication Service**
   - Responsabilidades: Mensajería interna, notificaciones
   - Endpoints: `/messages/*`, `/notifications/*`
   - Base de datos: MongoDB (mensajes, notificaciones)

6. **Report Service**
   - Responsabilidades: Analytics, dashboards, exportación
   - Endpoints: `/reports/*`, `/analytics/*`
   - Base de datos: PostgreSQL + Redis (caché de reportes)

7. **Notification Service**
   - Responsabilidades: Envío de emails, push notifications, SMS
   - Endpoints: `/notifications/send/*`
   - Integraciones: SendGrid, Firebase Cloud Messaging, Twilio

#### 2.2.2 Arquitectura Event-Driven

**Descripción:**
Los servicios se comunican mediante eventos asíncronos para procesos de larga duración y desacoplamiento.

**Eventos Principales:**

```javascript
// Evento: Usuario Creado
{
  eventType: 'user.created',
  userId: 123,
  email: 'usuario@ejemplo.com',
  role: 'DOCENTE',
  institutionId: 1,
  timestamp: '2026-05-16T10:00:00Z'
}

// Evento: Nota Actualizada
{
  eventType: 'grade.updated',
  studentId: 456,
  subjectId: 789,
  grade: 4.5,
  previousGrade: 4.0,
  updatedBy: 123,
  timestamp: '2026-05-16T10:05:00Z'
}

// Evento: Boletín Generado
{
  eventType: 'bulletin.generated',
  bulletinId: 100,
  studentId: 456,
  periodId: 2,
  status: 'pending_approval',
  generatedBy: 123,
  timestamp: '2026-05-16T10:10:00Z'
}

// Evento: Matricula Creada
{
  eventType: 'enrollment.created',
  enrollmentId: 200,
  studentId: 456,
  courseId: 10,
  periodId: 2,
  status: 'active',
  timestamp: '2026-05-16T10:15:00Z'
}
```

**Flujo de Eventos:**

```
Usuario Creado → [Auth Service] → Event: user.created
                                    ↓
                            [Notification Service]
                                    ↓
                            Email de bienvenida
                                    ↓
                            [Institution Service]
                                    ↓
                            Asignación de permisos
```

#### 2.2.3 Arquitectura de Capas (Layered Architecture)

**Descripción:**
Cada microservicio sigue una arquitectura de capas para separación de responsabilidades.

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Controllers)                            │
│  - HTTP Request/Response handling                           │
│  - Request validation                                        │
│  - Authentication/Authorization                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  BUSINESS LOGIC LAYER (Services)                             │
│  - Domain logic implementation                               │
│  - Business rules                                            │
│  - Transaction management                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  DATA ACCESS LAYER (Repositories)                           │
│  - Database queries                                          │
│  - ORM/ODM operations                                        │
│  - Caching strategy                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  PERSISTENCE LAYER (Database)                                │
│  - PostgreSQL / MongoDB                                      │
│  - Redis                                                     │
│  - S3                                                        │
└─────────────────────────────────────────────────────────────┘
```

## 3. Diseño de Componentes

### 3.1 Componentes Frontend

#### 3.1.1 Estructura de Componentes React

```
src/
├── components/
│   ├── ui/                    # Componentes UI reutilizables (shadcn/ui)
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   └── ...
│   ├── layout/                # Componentes de layout
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── MainLayout.jsx
│   ├── forms/                 # Componentes de formularios
│   │   ├── UserForm.jsx
│   │   ├── GradeForm.jsx
│   │   └── ...
│   └── common/                # Componentes comunes
│       ├── PageHeader.jsx
│       ├── Badge.jsx
│       ├── Toast.jsx
│       └── ...
├── pages/                     # Páginas por módulo
│   ├── auth/
│   │   └── Login.jsx
│   ├── admin/
│   │   ├── Usuarios.jsx
│   │   ├── Cursos.jsx
│   │   └── ...
│   ├── docente/
│   │   ├── Notas.jsx
│   │   ├── Asistencia.jsx
│   │   └── ...
│   └── ...
├── hooks/                     # Custom hooks
│   ├── useAuth.js
│   ├── useFormValidation.js
│   ├── useToast.js
│   └── ...
├── context/                   # Context providers
│   ├── AuthContext.jsx
│   ├── ImageContext.jsx
│   └── ConfigContext.jsx
├── store/                     # Redux store
│   ├── index.js
│   ├── slices/
│   │   ├── authSlice.js
│   │   ├── userSlice.js
│   │   └── ...
│   └── middleware/
├── services/                  # API services
│   ├── api.js
│   ├── authService.js
│   ├── userService.js
│   └── ...
├── utils/                     # Utilidades
│   ├── validators.js
│   ├── formatters.js
│   └── ...
└── styles/                    # Estilos globales
    ├── globals.css
    └── themes.css
```

#### 3.1.2 Componentes UI Reutilizables

**Button Component:**
```jsx
import { cn } from "@/lib/utils";

const Button = ({ 
  children, 
  variant = "default", 
  size = "default", 
  className,
  ...props 
}) => {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
    link: "text-blue-600 underline-offset-4 hover:underline"
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-8",
    icon: "h-10 w-10"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

**Modal Component:**
```jsx
import { X } from "lucide-react";

const Modal = ({ open, onClose, title, children, size = "md" }) => {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4"
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl`}>
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
```

#### 3.1.3 Custom Hooks

**useAuth Hook:**
```jsx
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

**useFormValidation Hook:**
```jsx
import { useState, useCallback } from 'react';

export const useFormValidation = (rules) => {
  const [errors, setErrors] = useState({});

  const validate = useCallback((field, value) => {
    const rule = rules[field];
    if (!rule) return '';

    if (rule.required && !value) {
      return `${rule.label} es requerido`;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `${rule.label} debe tener al menos ${rule.minLength} caracteres`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.patternMsg || `${rule.label} tiene formato inválido`;
    }

    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) return customError;
    }

    return '';
  }, [rules]);

  const handleChange = useCallback((field, value) => {
    const error = validate(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [validate]);

  const clearErrors = useCallback(() => setErrors({}), []);

  return { errors, validate, handleChange, clearErrors };
};
```

### 3.2 Componentes Backend

#### 3.2.1 Estructura de Servicios Node.js

```
src/
├── controllers/              # Controladores HTTP
│   ├── authController.js
│   ├── userController.js
│   ├── institutionController.js
│   └── ...
├── services/                 # Lógica de negocio
│   ├── authService.js
│   ├── userService.js
│   ├── institutionService.js
│   └── ...
├── models/                   # Modelos de datos
│   ├── User.js
│   ├── Institution.js
│   ├── Course.js
│   └── ...
├── repositories/             # Acceso a datos
│   ├── userRepository.js
│   ├── institutionRepository.js
│   └── ...
├── middleware/               # Middleware Express
│   ├── authMiddleware.js
│   ├── validationMiddleware.js
│   ├── errorHandler.js
│   └── ...
├── routes/                   # Definición de rutas
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── ...
├── utils/                    # Utilidades
│   ├── jwt.js
│   ├── bcrypt.js
│   ├── validators.js
│   └── ...
├── config/                   # Configuración
│   ├── database.js
│   ├── redis.js
│   └── ...
└── app.js                    # Entry point
```

#### 3.2.2 Controladores

**Auth Controller:**
```javascript
const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const { correo, password } = req.body;
      const result = await authService.login(correo, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async register(req, res) {
    try {
      const userData = req.body;
      const result = await authService.register(userData);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
```

#### 3.2.3 Servicios

**Auth Service:**
```javascript
const userRepository = require('../repositories/userRepository');
const jwt = require('../utils/jwt');
const bcrypt = require('../utils/bcrypt');

class AuthService {
  async login(correo, password) {
    const user = await userRepository.findByEmail(correo);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new Error('Usuario inactivo');
    }

    const accessToken = jwt.generateAccessToken(user);
    const refreshToken = jwt.generateRefreshToken(user);

    return {
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        institucionId: user.institucion_id
      },
      accessToken,
      refreshToken
    };
  }

  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.correo);
    if (existingUser) {
      throw new Error('El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(userData.password, 12);
    const newUser = await userRepository.create({
      ...userData,
      password_hash: passwordHash
    });

    const accessToken = jwt.generateAccessToken(newUser);
    const refreshToken = jwt.generateRefreshToken(newUser);

    return {
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        correo: newUser.correo,
        rol: newUser.rol
      },
      accessToken,
      refreshToken
    };
  }

  async refreshToken(refreshToken) {
    const decoded = jwt.verifyRefreshToken(refreshToken);
    const user = await userRepository.findById(decoded.id);
    
    if (!user || !user.activo) {
      throw new Error('Token inválido');
    }

    const accessToken = jwt.generateAccessToken(user);
    const newRefreshToken = jwt.generateRefreshToken(user);

    return { accessToken, refreshToken: newRefreshToken };
  }
}

module.exports = new AuthService();
```

#### 3.2.4 Repositories

**User Repository:**
```javascript
const { User } = require('../models');

class UserRepository {
  async findById(id) {
    return await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });
  }

  async findByEmail(correo) {
    return await User.findOne({ where: { correo } });
  }

  async create(userData) {
    return await User.create(userData);
  }

  async update(id, userData) {
    await User.update(userData, { where: { id } });
    return await this.findById(id);
  }

  async delete(id) {
    await User.destroy({ where: { id } });
  }

  async findAll(filters = {}) {
    return await User.findAll({ where: filters });
  }

  async findByInstitution(institucionId) {
    return await User.findAll({
      where: { institucion_id: institucionId },
      attributes: { exclude: ['password_hash'] }
    });
  }
}

module.exports = new UserRepository();
```

## 4. Diseño de Base de Datos

### 4.1 Modelo Entidad-Relación (ERD)

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ Instituciones│         │   Usuarios   │         │    Cursos    │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │ 1                      │ N                      │ 1
       │                        │                        │
       │ tiene                  │ pertenece a            │ tiene
       │                        │                        │
       │ N                      │ 1                      │ N
┌──────▼───────┐         ┌──────▼───────┐         ┌──────▼───────┐
│    Cursos    │         │  Matrículas  │         │   Materias   │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │ 1                      │ 1                      │ 1
       │                        │                        │
       │ tiene                  │ registra               │ tiene
       │                        │                        │
       │ N                      │ N                      │ N
┌──────▼───────┐         ┌──────▼───────┐         ┌──────▼───────┐
│   Materias   │         │    Notas     │         │  Asistencia  │
└──────────────┘         └──────────────┘         └──────────────┘
```

### 4.2 Esquema Detallado de Tablas

#### 4.2.1 Tabla: instituciones

```sql
CREATE TABLE instituciones (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    codigo_dane VARCHAR(20) UNIQUE,
    nit VARCHAR(20) UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    naturaleza VARCHAR(20) CHECK (naturaleza IN ('oficial', 'privada')),
    caracter VARCHAR(20) CHECK (caracter IN ('academico', 'tecnico')),
    departamento VARCHAR(50) NOT NULL,
    municipio VARCHAR(50) NOT NULL,
    zona VARCHAR(20) CHECK (zona IN ('urbana', 'rural')),
    direccion TEXT,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    sitio_web VARCHAR(200),
    rector VARCHAR(100),
    rector_documento VARCHAR(20),
    rector_correo VARCHAR(100),
    rector_telefono VARCHAR(20),
    rector_resolucion VARCHAR(100),
    niveles JSONB CHECK (jsonb_array_length(niveles) > 0),
    grados JSONB CHECK (jsonb_array_length(grados) > 0),
    sedes INTEGER DEFAULT 1 CHECK (sedes >= 1),
    modelo_pedagogico VARCHAR(50),
    resolucion_aprobacion VARCHAR(100),
    secretaria_educacion VARCHAR(100),
    codigo_etc VARCHAR(10),
    activa BOOLEAN DEFAULT true,
    licencia VARCHAR(20) CHECK (licencia IN ('basic', 'premium', 'enterprise')),
    vencimiento DATE,
    estudiantes INTEGER DEFAULT 0,
    docentes INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_institucion_licencia CHECK (
        (licencia = 'basic' AND estudiantes <= 100) OR
        (licencia = 'premium' AND estudiantes <= 500) OR
        (licencia = 'enterprise' AND estudiantes <= 5000)
    )
);

CREATE INDEX idx_instituciones_codigo ON instituciones(codigo);
CREATE INDEX idx_instituciones_activa ON instituciones(activa);
CREATE INDEX idx_instituciones_municipio ON instituciones(municipio);
```

#### 4.2.2 Tabla: usuarios

```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    institucion_id INTEGER REFERENCES instituciones(id) ON DELETE SET NULL,
    nombre VARCHAR(200) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    rol VARCHAR(50) NOT NULL CHECK (rol IN (
        'SUPER_ADMIN', 'ADMIN_INSTITUCIONAL', 'COORDINADOR',
        'SECRETARIA', 'DIRECCION', 'DOCENTE', 'DIRECTOR_GRUPO',
        'PSICOORIENTADOR', 'ESTUDIANTE', 'PADRE'
    )),
    password_hash VARCHAR(255) NOT NULL,
    hijos_ids INTEGER[] DEFAULT '{}',
    activo BOOLEAN DEFAULT true,
    avatar VARCHAR(10),
    metadata JSONB,
    last_login TIMESTAMP,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_usuario_hijos CHECK (
        rol = 'PADRE' OR array_length(hijos_ids, 1) IS NULL
    )
);

CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_usuarios_documento ON usuarios(documento);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_institucion ON usuarios(institucion_id);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_usuarios_hijos ON usuarios USING GIN(hijos_ids);
```

#### 4.2.3 Tabla: cursos

```sql
CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    institucion_id INTEGER REFERENCES instituciones(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    grado INTEGER NOT NULL CHECK (grado BETWEEN 0 AND 13),
    grupo VARCHAR(10) NOT NULL,
    director_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    periodo_id INTEGER,
    estudiantes INTEGER DEFAULT 0 CHECK (estudiantes >= 0),
    activo BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_director_rol CHECK (
        director_id IS NULL OR EXISTS (
            SELECT 1 FROM usuarios WHERE id = director_id AND rol IN ('DOCENTE', 'DIRECTOR_GRUPO')
        )
    ),
    UNIQUE(institucion_id, grado, grupo, periodo_id)
);

CREATE INDEX idx_cursos_institucion ON cursos(institucion_id);
CREATE INDEX idx_cursos_grado_grupo ON cursos(grado, grupo);
CREATE INDEX idx_cursos_director ON cursos(director_id);
CREATE INDEX idx_cursos_activo ON cursos(activo);
```

#### 4.2.4 Tabla: materias

```sql
CREATE TABLE materias (
    id SERIAL PRIMARY KEY,
    institucion_id INTEGER REFERENCES instituciones(id) ON DELETE CASCADE,
    curso_id INTEGER REFERENCES cursos(id) ON DELETE CASCADE,
    docente_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) UNIQUE,
    intensidad INTEGER DEFAULT 4 CHECK (intensidad BETWEEN 1 AND 10),
    hora_inicio TIME,
    hora_fin TIME,
    area VARCHAR(50),
    tipo_evaluacion VARCHAR(50) CHECK (tipo_evaluacion IN (
        'numerica', 'conceptual', 'mixta'
    )),
    activa BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_docente_rol CHECK (
        docente_id IS NULL OR EXISTS (
            SELECT 1 FROM usuarios WHERE id = docente_id AND rol = 'DOCENTE'
        )
    ),
    CONSTRAINT chk_hora_fin CHECK (hora_fin IS NULL OR hora_fin > hora_inicio)
);

CREATE INDEX idx_materias_institucion ON materias(institucion_id);
CREATE INDEX idx_materias_curso ON materias(curso_id);
CREATE INDEX idx_materias_docente ON materias(docente_id);
CREATE INDEX idx_materias_codigo ON materias(codigo);
CREATE INDEX idx_materias_activa ON materias(activa);
```

#### 4.2.5 Tabla: matriculas

```sql
CREATE TABLE matriculas (
    id SERIAL PRIMARY KEY,
    institucion_id INTEGER REFERENCES instituciones(id) ON DELETE CASCADE,
    estudiante_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    curso_id INTEGER REFERENCES cursos(id) ON DELETE CASCADE,
    periodo_id INTEGER,
    fecha DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN (
        'activa', 'inactiva', 'retirada', 'trasladada'
    )),
    acudiente VARCHAR(100),
    parentesco VARCHAR(50),
    telefono_acudiente VARCHAR(20),
    documentos JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_estudiante_rol CHECK (
        EXISTS (
            SELECT 1 FROM usuarios WHERE id = estudiante_id AND rol = 'ESTUDIANTE'
        )
    ),
    UNIQUE(estudiante_id, curso_id, periodo_id)
);

CREATE INDEX idx_matriculas_institucion ON matriculas(institucion_id);
CREATE INDEX idx_matriculas_estudiante ON matriculas(estudiante_id);
CREATE INDEX idx_matriculas_curso ON matriculas(curso_id);
CREATE INDEX idx_matriculas_estado ON matriculas(estado);
CREATE INDEX idx_matriculas_periodo ON matriculas(periodo_id);
```

#### 4.2.6 Tabla: notas

```sql
CREATE TABLE notas (
    id SERIAL PRIMARY KEY,
    institucion_id INTEGER REFERENCES instituciones(id) ON DELETE CASCADE,
    estudiante_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    materia_id INTEGER REFERENCES materias(id) ON DELETE CASCADE,
    periodo_id INTEGER,
    nota1 DECIMAL(3,1) CHECK (nota1 BETWEEN 0 AND 5),
    nota2 DECIMAL(3,1) CHECK (nota2 BETWEEN 0 AND 5),
    nota3 DECIMAL(3,1) CHECK (nota3 BETWEEN 0 AND 5),
    promedio DECIMAL(3,1) CHECK (promedio BETWEEN 0 AND 5),
    actividades JSONB,
    observaciones TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_notas_rango CHECK (
        (nota1 IS NULL OR nota1 BETWEEN 0 AND 5) AND
        (nota2 IS NULL OR nota2 BETWEEN 0 AND 5) AND
        (nota3 IS NULL OR nota3 BETWEEN 0 AND 5)
    ),
    UNIQUE(estudiante_id, materia_id, periodo_id)
);

CREATE INDEX idx_notas_institucion ON notas(institucion_id);
CREATE INDEX idx_notas_estudiante ON notas(estudiante_id);
CREATE INDEX idx_notas_materia ON notas(materia_id);
CREATE INDEX idx_notas_periodo ON notas(periodo_id);
CREATE INDEX idx_notas_promedio ON notas(promedio);
```

#### 4.2.7 Tabla: asistencia

```sql
CREATE TABLE asistencia (
    id SERIAL PRIMARY KEY,
    institucion_id INTEGER REFERENCES instituciones(id) ON DELETE CASCADE,
    estudiante_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    curso_id INTEGER REFERENCES cursos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'presente' CHECK (estado IN (
        'presente', 'ausente', 'tardanza', 'justificado'
    )),
    justificacion TEXT,
    justificado_por INTEGER REFERENCES usuarios(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_estudiante_rol_asistencia CHECK (
        EXISTS (
            SELECT 1 FROM usuarios WHERE id = estudiante_id AND rol = 'ESTUDIANTE'
        )
    ),
    UNIQUE(estudiante_id, curso_id, fecha)
);

CREATE INDEX idx_asistencia_institucion ON asistencia(institucion_id);
CREATE INDEX idx_asistencia_estudiante ON asistencia(estudiante_id);
CREATE INDEX idx_asistencia_curso ON asistencia(curso_id);
CREATE INDEX idx_asistencia_fecha ON asistencia(fecha);
CREATE INDEX idx_asistencia_estado ON asistencia(estado);
```

#### 4.2.8 Tabla: boletines

```sql
CREATE TABLE boletines (
    id SERIAL PRIMARY KEY,
    institucion_id INTEGER REFERENCES instituciones(id) ON DELETE CASCADE,
    estudiante_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    periodo_id INTEGER,
    numero_consecutivo VARCHAR(50) UNIQUE,
    estado VARCHAR(50) DEFAULT 'borrador' CHECK (estado IN (
        'borrador', 'revision_coordinador', 'aprobado_coordinador',
        'revision_direccion', 'aprobado_final', 'distribuido'
    )),
    fecha_generacion TIMESTAMP,
    generado_por INTEGER REFERENCES usuarios(id),
    revisado_coordinador_por INTEGER REFERENCES usuarios(id),
    aprobado_direccion_por INTEGER REFERENCES usuarios(id),
    pdf_url TEXT,
    firma_digital_url TEXT,
    sello_institucional_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_estudiante_rol_boletin CHECK (
        EXISTS (
            SELECT 1 FROM usuarios WHERE id = estudiante_id AND rol = 'ESTUDIANTE'
        )
    ),
    UNIQUE(estudiante_id, periodo_id)
);

CREATE INDEX idx_boletines_institucion ON boletines(institucion_id);
CREATE INDEX idx_boletines_estudiante ON boletines(estudiante_id);
CREATE INDEX idx_boletines_periodo ON boletines(periodo_id);
CREATE INDEX idx_boletines_estado ON boletines(estado);
CREATE INDEX idx_boletines_consecutivo ON boletines(numero_consecutivo);
```

### 4.3 Esquema MongoDB

#### 4.3.1 Colección: documentos

```javascript
{
  _id: ObjectId,
  institucion_id: Number,
  usuario_id: Number,
  tipo: String, // 'certificado', 'constancia', 'boletin', 'paz_y_salvo'
  categoria: String,
  estado: String, // 'pendiente', 'aprobado', 'entregado', 'anulado'
  contenido: {
    estudiante: {
      id: Number,
      nombre: String,
      documento: String,
      grado: String
    },
    periodo: {
      id: Number,
      nombre: String,
      año: Number
    },
    datos_academicos: Object,
    observaciones: String
  },
  pdf_url: String,
  firma_digital: {
    url: String,
    firmado_por: Number,
    fecha_firma: Date
  },
  metadatos: {
    copias: Number,
    destino: String,
    fecha_expedicion: Date,
    validez: Date
  },
  created_at: Date,
  updated_at: Date
}

// Índices
db.documentos.createIndex({ institucion_id: 1, usuario_id: 1 })
db.documentos.createIndex({ tipo: 1, estado: 1 })
db.documentos.createIndex({ created_at: -1 })
```

#### 4.3.2 Colección: audit_logs

```javascript
{
  _id: ObjectId,
  usuario_id: Number,
  institucion_id: Number,
  accion: String, // 'create', 'update', 'delete', 'login', 'logout'
  entidad: String, // 'usuario', 'nota', 'asistencia', etc.
  entidad_id: Number,
  cambios: {
    anterior: Object,
    nuevo: Object
  },
  contexto: {
    ip_address: String,
    user_agent: String,
    dispositivo: String,
    ubicacion: String
  },
  timestamp: Date
}

// Índices
db.audit_logs.createIndex({ usuario_id: 1, timestamp: -1 })
db.audit_logs.createIndex({ institucion_id: 1, timestamp: -1 })
db.audit_logs.createIndex({ entidad: 1, entidad_id: 1 })
db.audit_logs.createIndex({ timestamp: -1 })
```

#### 4.3.3 Colección: notificaciones

```javascript
{
  _id: ObjectId,
  usuario_id: Number,
  institucion_id: Number,
  tipo: String, // 'info', 'warning', 'error', 'success'
  categoria: String, // 'academico', 'administrativo', 'comunicacion'
  titulo: String,
  mensaje: String,
  leida: Boolean,
  fecha_lectura: Date,
  accion: {
    tipo: String, // 'link', 'modal', 'external'
    url: String,
    parametros: Object
  },
  prioridad: Number, // 1-5
  expira_en: Date,
  metadatos: Object,
  created_at: Date
}

// Índices
db.notificaciones.createIndex({ usuario_id: 1, leida: 1 })
db.notificaciones.createIndex({ institucion_id: 1, created_at: -1 })
db.notificaciones.createIndex({ expira_en: 1 }, { expireAfterSeconds: 0 })
```

## 5. Diseño de API

### 5.1 Principios de Diseño RESTful

#### 5.1.1 Convenciones de Nomenclatura

- **URLs en plural:** `/api/v1/usuarios`, `/api/v1/cursos`
- **Kebab-case en URLs:** `/api/v1/boletines-secretaria`
- **CamelCase en JSON:** `nombreUsuario`, `fechaNacimiento`
- **Versioning en URL:** `/api/v1/`, `/api/v2/`

#### 5.1.2 Métodos HTTP

| Método | Uso | Ejemplo |
|--------|-----|---------|
| GET | Obtener recursos | `GET /api/v1/usuarios` |
| POST | Crear recursos | `POST /api/v1/usuarios` |
| PUT | Actualizar recursos completos | `PUT /api/v1/usuarios/:id` |
| PATCH | Actualización parcial | `PATCH /api/v1/usuarios/:id` |
| DELETE | Eliminar recursos | `DELETE /api/v1/usuarios/:id` |

#### 5.1.3 Códigos de Estado HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Petición exitosa |
| 201 | Created | Recurso creado exitosamente |
| 204 | No Content | Petición exitosa sin contenido de respuesta |
| 400 | Bad Request | Error de validación |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | No autorizado |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto de datos (duplicado) |
| 422 | Unprocessable Entity | Error semántico |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

### 5.2 Especificación de Endpoints

#### 5.2.1 Autenticación

**POST /api/v1/auth/login**
```json
// Request
{
  "correo": "usuario@ejemplo.com",
  "password": "password123"
}

// Response 200
{
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "usuario@ejemplo.com",
    "rol": "DOCENTE",
    "institucionId": 1
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response 401
{
  "error": "Credenciales inválidas"
}
```

**POST /api/v1/auth/register**
```json
// Request
{
  "nombre": "María García",
  "documento": "123456789",
  "correo": "maria@ejemplo.com",
  "password": "password123",
  "rol": "DOCENTE",
  "institucionId": 1
}

// Response 201
{
  "user": {
    "id": 2,
    "nombre": "María García",
    "correo": "maria@ejemplo.com",
    "rol": "DOCENTE"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 5.2.2 Usuarios

**GET /api/v1/usuarios**
```javascript
// Query Parameters
?institucionId=1&rol=DOCENTE&activo=true&page=1&limit=20&search=Juan

// Response 200
{
  "data": [
    {
      "id": 1,
      "nombre": "Juan Pérez",
      "documento": "123456789",
      "correo": "juan@ejemplo.com",
      "rol": "DOCENTE",
      "activo": true,
      "institucionId": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**POST /api/v1/usuarios**
```json
// Request
{
  "nombre": "Carlos Ruiz",
  "documento": "987654321",
  "correo": "carlos@ejemplo.com",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67",
  "rol": "DOCENTE",
  "password": "password123",
  "institucionId": 1,
  "especialidad": "Matemáticas",
  "experiencia": "5 años",
  "titulo": "Licenciado en Matemáticas"
}

// Response 201
{
  "id": 3,
  "nombre": "Carlos Ruiz",
  "documento": "987654321",
  "correo": "carlos@ejemplo.com",
  "rol": "DOCENTE",
  "activo": true,
  "institucionId": 1,
  "createdAt": "2026-05-16T10:00:00Z"
}
```

**GET /api/v1/usuarios/:id**
```json
// Response 200
{
  "id": 1,
  "nombre": "Juan Pérez",
  "documento": "123456789",
  "correo": "juan@ejemplo.com",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67",
  "rol": "DOCENTE",
  "activo": true,
  "institucionId": 1,
  "especialidad": "Matemáticas",
  "experiencia": "5 años",
  "titulo": "Licenciado en Matemáticas",
  "createdAt": "2026-01-15T08:00:00Z",
  "updatedAt": "2026-05-10T14:30:00Z"
}
```

**PUT /api/v1/usuarios/:id**
```json
// Request
{
  "nombre": "Juan Pérez Updated",
  "telefono": "3007654321",
  "especialidad": "Física"
}

// Response 200
{
  "id": 1,
  "nombre": "Juan Pérez Updated",
  "documento": "123456789",
  "correo": "juan@ejemplo.com",
  "telefono": "3007654321",
  "rol": "DOCENTE",
  "activo": true,
  "institucionId": 1,
  "especialidad": "Física",
  "updatedAt": "2026-05-16T11:00:00Z"
}
```

#### 5.2.3 Notas

**GET /api/v1/notas**
```javascript
// Query Parameters
?estudianteId=1&materiaId=5&periodoId=2&page=1&limit=20

// Response 200
{
  "data": [
    {
      "id": 1,
      "estudianteId": 1,
      "estudianteNombre": "Juan Pérez",
      "materiaId": 5,
      "materiaNombre": "Matemáticas",
      "periodoId": 2,
      "periodoNombre": "Periodo 2",
      "nota1": 4.5,
      "nota2": 4.0,
      "nota3": 4.8,
      "promedio": 4.4,
      "actividades": [
        {
          "id": 1,
          "nombre": "Examen Parcial",
          "categoria": "examen",
          "peso": 30,
          "nota": 4.5
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

**POST /api/v1/notas**
```json
// Request
{
  "estudianteId": 1,
  "materiaId": 5,
  "periodoId": 2,
  "nota1": 4.5,
  "nota2": 4.0,
  "nota3": 4.8,
  "actividades": [
    {
      "nombre": "Examen Parcial",
      "categoria": "examen",
      "peso": 30,
      "nota": 4.5
    }
  ]
}

// Response 201
{
  "id": 1,
  "estudianteId": 1,
  "materiaId": 5,
  "periodoId": 2,
  "nota1": 4.5,
  "nota2": 4.0,
  "nota3": 4.8,
  "promedio": 4.4,
  "createdAt": "2026-05-16T12:00:00Z"
}
```

#### 5.2.4 Boletines

**POST /api/v1/boletines**
```json
// Request
{
  "estudianteId": 1,
  "periodoId": 2
}

// Response 201
{
  "id": 1,
  "estudianteId": 1,
  "periodoId": 2,
  "numeroConsecutivo": "BOL-2026-0001",
  "estado": "borrador",
  "fechaGeneracion": "2026-05-16T12:00:00Z",
  "generadoPor": 5,
  "createdAt": "2026-05-16T12:00:00Z"
}
```

**POST /api/v1/boletines/:id/aprobar**
```json
// Request
{
  "rol": "COORDINADOR",
  "comentarios": "Aprobado para revisión de dirección"
}

// Response 200
{
  "id": 1,
  "estado": "aprobado_coordinador",
  "revisadoCoordinadorPor": 3,
  "fechaRevision": "2026-05-16T13:00:00Z",
  "comentarios": "Aprobado para revisión de dirección",
  "updatedAt": "2026-05-16T13:00:00Z"
}
```

### 5.3 Documentación de API con Swagger

```yaml
openapi: 3.0.0
info:
  title: Sistema de Gestión Académica API
  version: 1.0.0
  description: API RESTful para el Sistema de Gestión Académica Multi-Institucional

servers:
  - url: https://api.sistema-academico.com/v1
    description: Servidor de producción

paths:
  /auth/login:
    post:
      summary: Iniciar sesión
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                correo:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
      responses:
        '200':
          description: Login exitoso
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/User'
                  accessToken:
                    type: string
                  refreshToken:
                    type: string
        '401':
          description: Credenciales inválidas

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        nombre:
          type: string
        correo:
          type: string
          format: email
        rol:
          type: string
          enum: [SUPER_ADMIN, ADMIN_INSTITUCIONAL, COORDINADOR, SECRETARIA, DIRECCION, DOCENTE, DIRECTOR_GRUPO, PSICOORIENTADOR, ESTUDIANTE, PADRE]
        institucionId:
          type: integer
```

## 6. Diseño de Seguridad

### 6.1 Arquitectura de Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE SEGURIDAD                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  1. Network Security (WAF, DDoS Protection)          │ │
│  └──────────────────────────────────────────────────────┘ │
│                              ↓                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  2. API Gateway (Rate Limiting, IP Whitelist)         │ │
│  └──────────────────────────────────────────────────────┘ │
│                              ↓                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  3. Authentication (JWT, OAuth2, SAML)                │ │
│  └──────────────────────────────────────────────────────┘ │
│                              ↓                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  4. Authorization (RBAC, ABAC)                        │ │
│  └──────────────────────────────────────────────────────┘ │
│                              ↓                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  5. Application Security (Input Validation, XSS)      │ │
│  └──────────────────────────────────────────────────────┘ │
│                              ↓                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  6. Data Security (Encryption, Masking)              │ │
│  └──────────────────────────────────────────────────────┘ │
│                              ↓                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  7. Database Security (RBAC, Encryption at Rest)      │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Implementación de Seguridad

#### 6.2.1 Middleware de Autenticación

```javascript
const jwt = require('../utils/jwt');
const redis = require('../config/redis');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Verificar si el token está en blacklist
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const decoded = jwt.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
```

#### 6.2.2 Middleware de Autorización

```javascript
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    next();
  };
};

const authorizePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userPermissions = await getUserPermissions(req.user.id);
      
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({ error: 'Permiso insuficiente' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Error de autorización' });
    }
  };
};
```

#### 6.2.3 Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');
const redis = require('redis');

const redisClient = redis.createClient();

const rateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 requests por ventana
  message: 'Demasiadas solicitudes, por favor intente más tarde',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting más estricto para endpoints sensibles
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Solo 5 intentos de login
  message: 'Demasiados intentos de login, cuenta bloqueada temporalmente'
});
```

#### 6.2.4 Encriptación de Datos Sensibles

```javascript
const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const ivLength = 16;

const encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

const decrypt = (encrypted, ivHex, authTagHex) => {
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
```

## 7. Diseño de Despliegue

### 7.1 Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────────┐
│                      DEVELOPMENT                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Local Docker Compose                                 │   │
│  │  - React App (localhost:3000)                        │   │
│  │  - Node.js API (localhost:5000)                      │   │
│  │  - PostgreSQL (localhost:5432)                        │   │
│  │  - MongoDB (localhost:27017)                          │   │
│  │  - Redis (localhost:6379)                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       STAGING                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AWS Staging Environment                              │   │
│  │  - EC2 (t3.medium) × 2                               │   │
│  │  - RDS PostgreSQL (db.t3.micro)                      │   │
│  │  - MongoDB Atlas (M0)                                │   │
│  │  - ElastiCache Redis (cache.t3.micro)                │   │
│  │  - S3 (staging bucket)                               │   │
│  │  - CloudFront (staging distribution)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AWS Production Environment                            │   │
│  │  - EKS Cluster (Kubernetes)                          │   │
│  │  - EC2 (m5.large) × 8 (Auto Scaling)                │   │
│  │  - RDS PostgreSQL Multi-AZ (db.m5.large)              │   │
│  │  - MongoDB Atlas (M10)                               │   │
│  │  - ElastiCache Redis Cluster (cache.m5.large)        │   │
│  │  - S3 (production bucket + CloudFront)              │   │
│  │  - ALB (Application Load Balancer)                   │   │
│  │  - Route 53 (DNS)                                    │   │
│  │  - CloudWatch (Monitoring)                           │   │
│  │  - AWS WAF (Security)                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Docker Compose (Development)

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@postgres:5432/sistema_academico
      - MONGODB_URI=mongodb://mongo:27017/sistema_academico
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key
      - JWT_REFRESH_SECRET=your-refresh-secret
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
      - mongo
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=sistema_academico
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  mongo_data:
  redis_data:
```

### 7.3 Kubernetes Deployment (Production)

```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: sistema-academico/frontend:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer

---
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 4
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: sistema-academico/backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 5000
    targetPort: 5000
  type: ClusterIP
```

### 7.4 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd frontend && npm ci
        cd ../backend && npm ci
    
    - name: Run tests
      run: |
        cd frontend && npm test
        cd ../backend && npm test
    
    - name: Run linter
      run: |
        cd frontend && npm run lint
        cd ../backend && npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker images
      run: |
        docker build -t sistema-academico/frontend:${{ github.sha }} ./frontend
        docker build -t sistema-academico/backend:${{ github.sha }} ./backend
    
    - name: Push to Docker Hub
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push sistema-academico/frontend:${{ github.sha }}
        docker push sistema-academico/backend:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
    - name: Deploy to Staging
      run: |
        # Deploy to AWS staging environment
        aws ecs update-service --cluster staging --service sistema-academico --force-new-deployment

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to Production
      run: |
        # Deploy to AWS production environment
        kubectl set image deployment/frontend frontend=sistema-academico/frontend:${{ github.sha }}
        kubectl set image deployment/backend backend=sistema-academico/backend:${{ github.sha }}
```

## 8. Conclusiones del Diseño Tecnológico

### 8.1 Resumen de Decisiones Arquitectónicas

1. **Microservicios:** Escalabilidad y desacoplamiento
2. **Event-Driven:** Procesos asíncronos y resiliencia
3. **React + Node.js:** Stack JavaScript full-stack consistente
4. **PostgreSQL + MongoDB:** Híbrido relacional/documental
5. **AWS Cloud:** Infraestructura robusta y escalable
6. **Docker + Kubernetes:** Contenedorización y orquestación
7. **JWT Authentication:** Stateless y escalable
8. **RESTful API:** Estándar industrial y compatibilidad

### 8.2 Beneficios del Diseño Propuesto

- **Escalabilidad:** Crecimiento sin reingeniería
- **Mantenibilidad:** Código modular y documentado
- **Seguridad:** Múltiples capas de protección
- **Performance:** Optimización en todas las capas
- **Disponibilidad:** Alta disponibilidad con redundancia
- **Costo-efectividad:** Optimización de recursos cloud

### 8.3 Próximos Pasos

1. **Prototipado:** Desarrollar MVP de servicios críticos
2. **Testing:** Pruebas de carga y seguridad
3. **Documentación:** Completar documentación técnica
4. **Capacitación:** Entrenamiento del equipo de desarrollo
5. **Implementación:** Despliegue gradual en fases

---

**Documento elaborado para el diseño tecnológico y arquitectónico del Sistema de Gestión Académica Multi-Institucional**
**Fecha:** Mayo 2026
**Versión:** 1.0
