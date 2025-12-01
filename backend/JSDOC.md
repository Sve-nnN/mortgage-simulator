# Documentación de Código - Backend

Este proyecto utiliza **JSDoc** para documentar todo el código del backend.

## Autor

**Juan Carlos Angulo**

## Estructura de la Documentación

### Servicios (`services/`)
- **financial.service.js**: Funciones de cálculo financiero (TEM, cronograma, indicadores)

### Controladores (`controllers/`)
- **auth.controller.js**: Autenticación y registro de usuarios
- **client.controller.js**: Gestión de clientes
- **property.controller.js**: Gestión de propiedades
- **simulation.controller.js**: Cálculo y guardado de simulaciones
- **dashboard.controller.js**: Estadísticas del dashboard

### Modelos (`models/`)
- **User.js**: Esquema de usuario con métodos de autenticación
- **Client.js**: Esquema de cliente con perfil socioeconómico
- **Property.js**: Esquema de propiedad inmobiliaria
- **Simulation.js**: Esquema completo de simulación hipotecaria

### Middleware (`middleware/`)
- **authMiddleware.js**: Protección de rutas con JWT

### Configuración (`config/`)
- **db.js**: Conexión a MongoDB

## Generar Documentación HTML

Para generar la documentación HTML completa:

```bash
npm run docs
```

La documentación se generará en el directorio `./docs/`.

Para generar y abrir automáticamente en el navegador:

```bash
npm run docs:serve
```

## Convenciones de Documentación

### Funciones
```javascript
/**
 * Descripción breve de la función
 * 
 * @async
 * @function nombreFuncion
 * @param {tipo} parametro - Descripción del parámetro
 * @returns {Promise<tipo>} Descripción del valor de retorno
 * @throws {Error} Descripción de errores que puede lanzar
 * 
 * @example
 * const resultado = await nombreFuncion(parametro);
 */
```

### Controladores
```javascript
/**
 * Descripción de la acción del controlador
 * 
 * @async
 * @function nombreControlador
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * 
 * @description POST /api/ruta (Private/Public)
 */
```

### Modelos
```javascript
/**
 * Nombre del Modelo
 * Descripción del propósito del modelo
 * 
 * @author Juan Carlos Angulo
 * @module models/NombreModelo
 */

/**
 * Esquema del Modelo
 * @typedef {Object} EsquemaModelo
 * @property {tipo} campo - Descripción del campo
 */
```

## Características Documentadas

### Cálculos Financieros
- **TEM (Tasa Efectiva Mensual)**: Conversión de tasas nominales y efectivas
- **Sistema Francés**: Generación de cronograma de amortización
- **Indicadores**: TCEA, TIR, VAN con COK
- **Bono del Buen Pagador**: Descuento en primeras cuotas
- **Costos Adicionales Dinámicos**: Fijos y porcentuales

### API Endpoints
Todos los endpoints están documentados con:
- Descripción de funcionalidad
- Ruta y método HTTP
- Nivel de acceso (Private/Public)
- Parámetros de entrada
- Respuestas esperadas

### Modelos de Datos
Esquemas MongoDB documentados con:
- Tipos de datos
- Validaciones
- Referencias a otros modelos
- Campos requeridos/opcionales
- Valores por defecto

## Instalación de JSDoc (opcional)

Si necesitas instalar JSDoc globalmente:

```bash
npm install -g jsdoc
```

O usar la versión local del proyecto:

```bash
npx jsdoc -c jsdoc.json
```

## Notas Adicionales

- La documentación se actualiza automáticamente al ejecutar `npm run docs`
- Los comentarios JSDoc siguen el estándar oficial: https://jsdoc.app/
- Todos los archivos importantes tienen documentación completa

