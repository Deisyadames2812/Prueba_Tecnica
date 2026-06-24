# 🚀 Reto de Automatización de APIs con Playwright

Este repositorio contiene la suite de pruebas automatizadas para la API de gestión de contactos, desarrollada como parte de la prueba técnica de QA Automation. La solución se diseñó bajo una arquitectura modular y estructurada para validar flujos de negocio de extremo a extremo (E2E) en el backend.

---

## 🛠️ Requisitos Previos y Dependencias

Antes de ejecutar las pruebas, asegúrese de contar con las siguientes herramientas instaladas en su entorno local:

1. **Node.js** (Versión LTS recomendada, v18 o superior).
2. **Navegadores de pruebas:** Proporcionados directamente por el core de Playwright (Chromium, Firefox, WebKit).

### Instrucciones de Instalación:

Para desplegar el entorno e instalar todas las dependencias necesarias, ejecute los siguientes comandos en la terminal de su máquina local:

# 1. Clonar el repositorio
git clone https://github.com/Deisyadames2812/Prueba_Tecnica.git

# 2. Instalar las dependencias de Node.js especificadas en el proyecto
npm install

# 3. Instalar los binarios de los navegadores controlados por Playwright
npx playwright install

## 📝 Resumen de la Automatización Realizada

La automatización se estructuró de forma **modular, escalable e independiente**, separando las responsabilidades de la API en dos suites de pruebas principales localizadas en la carpeta `tests/`:

### 🛡️ 1. Módulo de Autenticación y Perfil (`tests/auth.spec.js`)
Automatiza y valida el ciclo de vida completo de la cuenta de un usuario o asesor:
* **Creación Dinámica:** Registro de un nuevo usuario utilizando credenciales únicas y aleatorias generadas en tiempo de ejecución (evitando colisiones de datos).
* **Inicio de Sesión (LogIn):** Extracción segura y almacenamiento dinámico del Token de Autorización (`Bearer Token`).
* **Verificación y Mutación:** Consulta del perfil (`GET /users/me`) y actualización parcial de datos (`PATCH /users/me`).
* **Cierre de Sesión:** Invalidación controlada del token activo (`POST /users/logout`).

### 👥 2. Módulo de Gestión de Contactos - CRUD (`tests/contacts.spec.js`)
Valida de forma secuencial (`mode: 'serial'`) el flujo completo de administración de clientes independientes:
* **Aislamiento de Entorno:** Utiliza un hook `beforeAll` para crear y autenticar un usuario exclusivo de fondo, garantizando que este módulo sea totalmente autónomo y no dependa de otros archivos.
* **Flujo CRUD Completo:**
  * `POST /contacts`: Creación de un contacto y captura dinámica de su ID único (`_id`).
  * `GET /contacts`: Listado total de contactos, renderizado en consola mediante `console.table()` para auditorías legibles.
  * `GET /contacts/:id`: Consulta específica utilizando el ID capturado previamente.
  * `PUT /contacts/:id`: Modificación total de los registros del contacto.
  * `PATCH /contacts/:id`: Mutación parcial y específica de atributos (ej. actualización de nombres).
  * `DELETE /contacts/:id`: Eliminación definitiva del recurso y validación de texto plano en la respuesta.

## 🏃‍♂️ Comandos de Ejecución

Una vez completada la instalación de dependencias, puede ejecutar la suite utilizando las siguientes modalidades:

* **Modo Interactivo (Recomendado - Interfaz de Usuario de Playwright):** Permite auditar visualmente el paso a paso, peticiones de red, tiempos de respuesta y logs tabulados de cada endpoint.
  ```bash
  npx playwright test --ui

* **Modo Headless (Ejecución silenciosa en Consola):** Ideal para integraciones continuas, ejecuta las pruebas en paralelo a través de múltiples hilos en segundo plano.
  ```bash
  npx playwright test
