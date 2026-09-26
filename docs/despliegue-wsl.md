# Guía de desarrollo en WSL2

## Preparar servicios

Abre Ubuntu desde WSL2. El directorio del proyecto es `~/taller3apiweeb`.

- Comprueba Node/npm, PostgreSQL y Git con `node -v`, `npm -v`, `psql --version` y `git --version`.
- PostgreSQL debe estar iniciado y la base/rol local creados. No escribas la contraseña en comandos que queden en el historial.
- En la raíz, crea `.env.ecommerce` desde `.env.ecommerce.example`, reemplaza todos los valores de ejemplo y ejecuta `chmod 600 .env.ecommerce`.
- Aplica las tablas con el comando indicado en el README.

## Ejecutar en dos terminales

Terminal 1, backend:

```bash
cd ~/taller3apiweeb
npm start
```

Debe mostrar que escucha en el puerto configurado (por defecto 3000). Comprueba `http://localhost:3000/`.

Terminal 2, frontend:

```bash
cd ~/taller3apiweeb/frontend/frontend
npm install
npm run dev -- --host 0.0.0.0
```

Abre `http://localhost:5173` desde el navegador de Windows. Si cambias `PORT` o el origen del frontend, actualiza también `CORS_ORIGIN` y la configuración del servicio HTTP del cliente.

## Compilar

```bash
cd ~/taller3apiweeb/frontend/frontend
npm run build
```

La carpeta `dist/` es salida generada y no debe versionarse. `.env.ecommerce`, secretos JWT, credenciales PostgreSQL y `node_modules/` tampoco deben subirse al repositorio.