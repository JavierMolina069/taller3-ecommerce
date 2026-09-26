# Preparación para el laboratorio AWS Academy

El despliegue se realiza cuando el laboratorio esté activo y entregue cuenta temporal, región, duración y recursos permitidos. No pongas credenciales AWS en Git ni en el frontend.

## Antes del laboratorio

- Mantén el proyecto ejecutable localmente con PostgreSQL y variables de entorno.
- Asegura que `.env.ecommerce`, archivos de credenciales, `node_modules/` y `dist/` estén excluidos de Git.
- Decide una topología compatible con las restricciones del curso: API Node, PostgreSQL administrado o instancia autorizada, y frontend estático. Confirma primero los servicios que permite el laboratorio.

## Al activarlo

1. Inicia el laboratorio y usa únicamente las credenciales y la región que indique AWS Academy.
2. Revisa presupuesto, políticas y límites antes de crear recursos.
3. Despliega API, base de datos y frontend; configura secretos en el mecanismo de configuración seguro permitido.
4. Configura CORS para el dominio del frontend, HTTPS y variables de producción.
5. Prueba registro, login, catálogo, compra, actualización de stock y cancelación.
6. Documenta URL, arquitectura y pasos de apagado/eliminación para evitar consumir recursos fuera de la sesión.

No hay despliegue AWS realizado todavía; depende de que el laboratorio esté activo y de sus permisos.