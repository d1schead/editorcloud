# Editor en la nube — Paso a paso

Este es un ejemplo mínimo funcional de un **editor de texto** con **usuarios registrados** usando:
- Node.js + Express
- SQLite
- JWT
- Quill.js (editor WYSIWYG)

## 1) Requisitos
- Node.js 18+ (incluye `npm`)

## 2) Instalar dependencias
```bash
npm install
```

## 3) Ejecutar en local
```bash
npm start
# Abre http://localhost:3000
```
> Opcional: define `JWT_SECRET` y `PORT` como variables de entorno.

## 4) Probar
- Registrarte con usuario y contraseña.
- Inicia sesión (se guarda un token en localStorage).
- Escribe en el editor y pulsa **Guardar**.
- Tus últimos 10 documentos aparecerán abajo.

### Pruebas por terminal (opcional)
```bash
# Registrar
curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d '{"username":"laura","password":"123456"}'

# Login
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"username":"laura","password":"123456"}'
# Copia el token del JSON devuelto

# Guardar documento
curl -X POST http://localhost:3000/save -H "Content-Type: application/json" -H "Authorization: Bearer TU_TOKEN" -d '{"content":"<p>Hola mundo</p>"}'

# Listar documentos
curl http://localhost:3000/documents -H "Authorization: Bearer TU_TOKEN"
```

## 5) Despliegue rápido
- **Render** / **Railway**: crea un servicio web, selecciona este repo o sube los archivos, comando: `npm start`.
- Establece `JWT_SECRET` en variables de entorno.
- **Frontend** ya está servido desde Express (`/public`).

## 6) Notas y mejoras
- Hash de contraseñas con **bcrypt**.
- Tokens **JWT** válidos 2 horas.
- Archivos a ignorar: `node_modules`, `database.sqlite`.
- Siguientes pasos: auto-guardado, compartir documentos, edición colaborativa (Y.js), recuperación de contraseña, roles por documento.
