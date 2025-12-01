# Sistema de Simulación de Crédito Hipotecario

Sistema web completo para la simulación y gestión de créditos hipotecarios, desarrollado con tecnologías modernas y desplegado en la nube.

## Descripción

Aplicación full-stack que permite a instituciones financieras y asesores hipotecarios:
- Gestionar clientes y propiedades
- Simular créditos hipotecarios con el Sistema Francés
- Calcular indicadores financieros (TEM, TCEA, TIR, VAN)
- Generar cronogramas de pago detallados
- Visualizar estadísticas en dashboard interactivo

## Características Principales

### Gestión de Datos
- **CRUD de Clientes**: Registro completo con perfil socioeconómico
- **CRUD de Propiedades**: Gestión de inmuebles con estados y valores
- **Historial de Simulaciones**: Almacenamiento y consulta de simulaciones previas

### Simulación Financiera
- **Sistema Francés de Amortización**: Cuotas constantes durante todo el período
- **Tasas**: TEA y TNA con conversión automática a TEM
- **Capitalización**: Mensual y Diaria
- **Período de Gracia**: Total (intereses capitalizados) y Parcial (solo pago de intereses)
- **Seguros**: Desgravamen (0.05%) y Riesgo (0.03%)
- **Bono del Buen Pagador**: Descuento configurable por pago puntual
- **Costos Adicionales**: Sistema dinámico de costos iniciales (fijos o porcentuales)
- **Monedas**: Soles (PEN) y Dólares (USD)

### Indicadores Financieros
- **TEM** (Tasa Efectiva Mensual): Tasa mensual efectiva aplicada al crédito
- **TCEA** (Tasa de Costo Efectivo Anual): Costo real anual del crédito incluyendo todos los costos
- **TIR** (Tasa Interna de Retorno): Tasa de rendimiento del flujo de caja
- **VAN** (Valor Actual Neto): Valor presente neto usando COK como tasa de descuento

### Dashboard y Reportes
- Gráficos de evolución de simulaciones
- Estadísticas de clientes, propiedades y simulaciones
- Cronograma detallado de pagos con exportación

## Stack Tecnológico
### Backend
- **Runtime**: Node.js 22
- **Framework**: Express.js
- **Base de Datos**: MongoDB
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Mongoose Schema Validation
- **Cálculos**: Decimal.js (alta precisión)
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **UI Components**: Custom components con Tailwind CSS
- **Gráficos**: Recharts
- **Internacionalización**: i18next (ES/EN)
- **Notificaciones**: Sonner
- **Testing**: Vitest + Testing Library

### DevOps
- **Containerización**: Docker + Docker Hub
- **Deployment Backend**: Render
- **Deployment Frontend**: Vercel
- **CI/CD**: GitHub Actions (automático desde main)
- **Base de Datos**: MongoDB Atlas

## Instalación y Configuración

### Prerrequisitos
- Node.js 22 o superior
- MongoDB (local o Atlas)
- Docker y Docker Compose (opcional)

### Instalación Local

#### 1. Clonar el repositorio
```bash
git clone https://github.com/Sve-nnN/mortgage-simulator.git
cd mortgage-simulator
```

#### 2. Configurar Backend
```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env
```

Configurar variables de entorno en `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mortgage-simulator
JWT_SECRET=tu_clave_secreta_muy_larga_aqui
```

#### 3. Configurar Frontend
```bash
cd ../frontend
npm install

# Crear archivo .env
cp .env.example .env
```

Configurar variables de entorno en `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

#### 4. Ejecutar en desarrollo
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Instalación con Docker

```bash
# Construir y ejecutar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## Testing

### Backend
```bash
cd backend
npm test                    # Ejecutar todos los tests
npm test -- --coverage      # Con reporte de cobertura
npm test -- --watch        # Modo watch
```

### Frontend
```bash
cd frontend
npm test                    # Ejecutar todos los tests
npm test -- --coverage      # Con reporte de cobertura
```

### Cobertura de Tests
Los reportes de cobertura se generan en:
- Backend: `backend/coverage/`
- Frontend: `frontend/coverage/`

## Deployment

### URLs de Producción
- **Frontend**: https://mortgage-simulator-khaki.vercel.app
- **Backend**: https://mortgage-simulator-backend-latest.onrender.com
- **API Base**: https://mortgage-simulator-backend-latest.onrender.com/api

### Deploy en Render (Backend)
1. Crear cuenta en https://render.com
2. Conectar repositorio de GitHub
3. Configurar Web Service:
   - Environment: Docker
   - Docker Image: `svennn420/mortgage-simulator-backend:latest`
4. Agregar variables de entorno
5. Deploy automático

### Deploy en Vercel (Frontend)
1. Crear cuenta en https://vercel.com
2. Importar repositorio de GitHub
3. Configurar:
   - Framework: Vite
   - Root Directory: `frontend`
4. Agregar variable de entorno: `VITE_API_URL`
5. Deploy automático

Ver guías detalladas:
- [Guía de Deploy en Render](./RENDER_DEPLOYMENT.md)
- [Guía de Deploy en Vercel](./VERCEL_DEPLOYMENT.md)
- [Guía de Deploy en Docker Hub](./DOCKER_DEPLOYMENT.md)

## 📚 Documentación de API

### Autenticación
Todas las rutas (excepto login/register) requieren token JWT en el header:
```
Authorization: Bearer <token>
```

### Endpoints Principales

#### Auth
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

#### Clients
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

#### Properties
- `GET /api/properties` - Listar propiedades
- `POST /api/properties` - Crear propiedad
- `PUT /api/properties/:id` - Actualizar propiedad
- `DELETE /api/properties/:id` - Eliminar propiedad

#### Simulations
- `POST /api/simulate/calculate` - Calcular simulación
- `POST /api/simulate/save` - Guardar simulación
- `GET /api/simulate/:id` - Obtener simulación

#### Dashboard
- `GET /api/dashboard/stats` - Obtener estadísticas

Ver documentación completa en [API.md](./docs/API.md)

## Configuración Avanzada

### Variables de Entorno

#### Backend (`backend/.env`)
```env
# Servidor
PORT=5000

# Base de Datos
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Autenticación
JWT_SECRET=clave_secreta_de_64_caracteres_minimo

# Entorno
NODE_ENV=production
```

#### Frontend (`frontend/.env`)
```env
# API
VITE_API_URL=https://tu-backend.onrender.com/api
```

## Guía de Uso

### 1. Registro e Inicio de Sesión
1. Crear cuenta desde `/signup`
2. Iniciar sesión en `/login`

### 2. Gestión de Clientes
1. Ir a "Clientes" en el menú
2. Click en "Agregar Cliente"
3. Completar formulario con:
   - DNI
   - Nombres y Apellidos
   - Ingresos mensuales
   - Carga familiar

### 3. Gestión de Propiedades
1. Ir a "Propiedades"
2. Click en "Agregar Propiedad"
3. Completar:
   - Código único
   - Dirección
   - Valor de venta
   - Moneda (PEN/USD)
   - Estado (Planos/Construcción/Terminado)

### 4. Simulación de Crédito
1. Ir a "Simulador"
2. **Paso 1**: Seleccionar cliente y propiedad
3. **Paso 2**: Configurar parámetros:
   - Monto del préstamo
   - Tasa de interés (TEA o TNA)
   - Plazo en meses
   - Tipo de gracia (opcional)
   - COK - Costo de Oportunidad (para cálculo de VAN)
   - Bono del Buen Pagador (opcional):
     * Activar/desactivar
     * Meses de aplicación
     * Porcentaje de descuento
   - Costos Adicionales (opcional):
     * Click en "Agregar Costo"
     * Ingresar nombre del costo
     * Seleccionar tipo: Monto Fijo o Porcentaje
     * Si es porcentaje, elegir base: Monto del Préstamo o Valor de la Propiedad
     * Ingresar valor
     * Puede agregar múltiples costos
4. **Paso 3**: Ver resultados:
   - Indicadores (TEM, TCEA, TIR, VAN)
   - Resumen de Costos Iniciales (si aplica)
   - Cronograma detallado con columnas:
     * Número de cuota
     * Fecha
     * Interés
     * Amortización
     * Seguros
     * Bono (si aplica, mostrado como descuento en verde)
     * Cuota Total
     * Saldo Final
   - Guardar simulación

### 5. Dashboard
- Visualizar estadísticas generales
- Ver gráfico de simulaciones
- Acceder a simulaciones recientes

## Fórmulas Financieras Implementadas

### Conversión de Tasas

**De TEA a TEM:**
```
TEM = (1 + TEA)^(1/12) - 1
```

**De TNA a TEM (capitalización mensual):**
```
TEM = TNA / 12
```

**De TNA a TEM (capitalización diaria):**
```
j = TNA / 360
TEM = (1 + j)^30 - 1
```

### Sistema Francés
**Cuota constante:**
```
R = P × [i × (1+i)^n] / [(1+i)^n - 1]
```

Donde:
- P = Monto del préstamo
- i = TEM (tasa efectiva mensual)
- n = Número de cuotas

### Período de Gracia

**Gracia Total:**
- Cuota = 0
- Interés se capitaliza: Saldo_nuevo = Saldo + Interés

**Gracia Parcial:**
- Cuota = Interés del período
- Saldo permanece constante

### Bono del Buen Pagador
```
Descuento_mensual = Cuota × (Porcentaje_Bono / 100)
Cuota_Final = Cuota - Descuento_mensual
```

Aplicable durante los primeros N meses configurados (típicamente 12 meses).

### TCEA (Tasa de Costo Efectivo Anual)
```
TCEA = [(1 + TIR_mensual)^12 - 1] × 100
```

### VAN (Valor Actual Neto)
```
VAN = Σ [Flujo_t / (1 + COK_mensual)^t]
```

Donde:
- Flujo_0 = Monto_Préstamo - Costos_Iniciales
- Flujo_1..n = -Cuota_Total de cada mes
- COK_mensual = (1 + COK_anual)^(1/12) - 1

### Costos Adicionales

El sistema permite agregar costos adicionales de forma dinámica con dos modalidades:

**1. Monto Fijo:**
```
Costo = Valor_Fijo
```

**2. Porcentaje sobre Base:**
```
Costo = Base × (Porcentaje / 100)
```

Donde Base puede ser:
- **Monto del Préstamo**: Costos calculados sobre el monto financiado
- **Valor de la Propiedad**: Costos calculados sobre el valor total del inmueble

**Ejemplos de Costos Adicionales:**
- Gastos notariales: 2% del valor de la propiedad
- Gastos registrales: 1.5% del valor de la propiedad
- Tasación: Monto fijo (ej: 500 PEN)
- Seguro de incendio: 0.1% del valor de la propiedad
- Comisión bancaria: 1% del monto del préstamo
- Estudio de títulos: Monto fijo (ej: 300 PEN)

**Cálculo Total:**
```
Costos_Iniciales_Total = Σ Costos_Fijos + Σ (Base × Porcentaje/100)
```

Estos costos se restan del flujo inicial para el cálculo del VAN y TCEA.

## Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto fue desarrollado como trabajo final del curso de Finanzas e Ingeniería Económica.

## Autores
- **Juan Carlos Angulo** - [@Sve-nnN](https://github.com/Sve-nnN)


