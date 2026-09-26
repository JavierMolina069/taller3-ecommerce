# Vitrina — tienda en línea

Proyecto académico de e-commerce para Taller de Desarrollo III. Backend Node.js/Express con arquitectura hexagonal, PostgreSQL y cliente SPA React + Vite.

## Requisitos

- Ubuntu en WSL2
- Node.js y npm
- PostgreSQL y `psql`
- Git

## Inicio rápido en WSL

Desde la raíz del proyecto `~/taller3apiweeb`:

1. Configura PostgreSQL y las variables de entorno. Copia `.env.ecommerce.example` a `.env.ecommerce`, completa los valores locales y protege el archivo (`chmod 600 .env.ecommerce`). Nunca publiques ese archivo.
2. Aplica el esquema: `psql -h 127.0.0.1 -U taller3_ecommerce_app -d taller3_ecommerce_db -W -f src/infrastructure/database/schema.sql`.
3. Inicia el backend en una terminal: `npm start` (API en `http://localhost:3000`).
4. En otra terminal: `cd frontend/frontend && npm install && npm run dev -- --host 0.0.0.0`.
5. Abre `http://localhost:5173` en Windows. Para producción local del cliente: `cd frontend/frontend && npm run build`.

El origen permitido por CORS debe coincidir con el origen del frontend (`CORS_ORIGIN`, normalmente `http://localhost:5173`). No uses claves de ejemplo en un entorno desplegado.

## Arquitectura y API

- [Arquitectura y modelo relacional](docs/arquitectura.md)
- [Especificación de endpoints](docs/endpoints.md)
- [Guía de WSL](docs/despliegue-wsl.md)
- [Preparación para AWS Academy](docs/aws-academy.md)

## Seguridad y pagos

Las contraseñas se almacenan con hash bcrypt. Las rutas de administración requieren JWT y rol administrador. El método de pago con tarjeta es demostrativo: no captura datos de tarjeta ni procesa cargos reales.

## Verificación conocida

El cliente compiló correctamente con `npm run build` en la revisión del 26 de septiembre de 2026. El paquete backend todavía conserva el script placeholder de pruebas; antes de entregar, completa una revisión funcional manual de registro/login, catálogo, pedido, stock y cancelación.