# Sistema de Gestión Administrativa

Sistema de información para una papelería: control de productos, tareas pendientes, ingresos, gastos y reportes económicos.

Diseñado a partir del documento EV8 de planeación (Nidia Milena Mahecha Álvarez).

## Requisitos

- Node.js 18 o superior
- npm

## Cómo ejecutar

En una terminal:

```bash
cd backend
copy .env.example .env
npm install
npm run start:dev
```

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

La API queda en [http://localhost:3000/api](http://localhost:3000/api).

## Acceso inicial

- Correo: `admin@papeleria.com`
- Contraseña: `Admin123`

La base de datos SQLite se crea sola en `backend/data/papeleria.sqlite` con categorías, productos, tareas y movimientos de ejemplo.

## Módulos

| Pantalla | Función |
|---|---|
| Inicio | Resumen de ingresos, gastos, saldo y tareas |
| Tareas | Registrar, editar, completar y consultar pendientes |
| Ingresos y gastos | Ventas, gastos por categoría y filtros por fecha |
| Productos | Inventario, precios y ubicación en el local |
| Categorías | Categorías de productos y de gastos |
| Reportes | Totales, comparación y gastos por categoría |
| Configuración | Datos del usuario que administra el negocio |

Al registrar una venta asociada a un producto, el sistema descuenta la cantidad disponible.
