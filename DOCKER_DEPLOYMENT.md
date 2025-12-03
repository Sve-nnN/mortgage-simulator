# Subir imágenes a Docker Hub

Esta guía explica cómo construir y publicar las imágenes del backend y del frontend en Docker Hub (o cualquier otro registry compatible). Una vez allí, Railway puede usar el tag que quieras para desplegar el servicio.

## Precondiciones
1. Tener una cuenta activa en Docker Hub o en el registry de tu preferencia.
2. Iniciar sesión localmente:
   ```bash
   docker login
   ```
3. Definir un nombre de repositorio propio (por ejemplo `tuusuario/mortgage-simulator-backend`). Reemplace `tuusuario` por el nombre real de tu cuenta.

## 1. Backend
1. Construye la imagen con la etiqueta deseada:
   ```bash
   docker build -t tuusuario/cbackend
   ```
2. Opcional: etiqueta otra versión (por ejemplo `v1.0.0`):
   ```bash
   docker tag tuusuario/mortgage-simulator-backend:latest tuusuario/mortgage-simulator-backend:v1.0.0
   ```
3. Publícala en Docker Hub:
   ```bash
   docker push tuusuario/mortgage-simulator-backend:latest
   ```
4. Verifica que Railway apuntará al tag que quieras (por ejemplo `latest`). También puedes usar tags semánticos para controlar versiones.

## 2. Frontend
1. Construye la imagen:
   ```bash
   docker build -t tuusuario/mortgage-simulator-frontend:latest ./frontend
   ```
2. (Opcional) Genera un tag secundario:
   ```bash
   docker tag tuusuario/mortgage-simulator-frontend:latest tuusuario/mortgage-simulator-frontend:v1.0.0
   ```
3. Empuja la imagen:
   ```bash
   docker push tuusuario/mortgage-simulator-frontend:latest
   ```
4. Railway o cualquier otro entorno puede descargar esta imagen para desplegar el frontend. Si usas Railway, configura el servicio tipo `Docker` o `Container` y apunta al repo y tag que publiques.

## 3. Validar localmente (opcional)
- Backend:
  ```bash
  docker run --rm -p 5000:5000 --env-file backend/.env tuusuario/mortgage-simulator-backend:latest
  ```
- Frontend:
  ```bash
  docker run --rm -p 5173:5173 --env VITE_API_URL=http://localhost:5000/api tuusuario/mortgage-simulator-frontend:latest
  ```
Esto ayuda a asegurar que no hay conflictos de variables antes de subir las imágenes.

## 4. Buenas prácticas
- Evita subir secretos: usa variables de entorno en Railway en lugar de hardcodearlos en la imagen.
- Automatiza el versionado con Git tags o un pipeline CI/CD que construya y publique cada vez que hagas merge en `main`.
- Considera limpiar imágenes antiguas con `docker image prune` si ocupan mucho espacio.
