import { test, expect } from '@playwright/test';

const BASE_URL = 'https://thinking-tester-contact-list.herokuapp.com';

// Forzamos la ejecución secuencial en este módulo
test.describe.configure({ mode: 'serial' });

test.describe('Módulo de Gestión de Contactos (CRUD Completo)', () => {
  let emailUnico;
  let passwordUnico = 'Password123!';
  let token = '';
  let contactId = ''; // Aquí guardaremos el ID generado dinámicamente

  // PRECONDICIÓN: Creamos un usuario fresco y nos logueamos para tener un token limpio
  test.beforeAll(async ({ request }) => {
    const randomId = Math.floor(Math.random() * 100000);
    emailUnico = `qa_contact_master_${randomId}@fake.com`;

    // 1. Crear usuario de fondo
    await request.post(`${BASE_URL}/users`, {
      data: { firstName: "Contact", lastName: "Manager", email: emailUnico, password: passwordUnico }
    });

    // 2. Loguearse para extraer el token
    const loginRes = await request.post(`${BASE_URL}/users/login`, {
      data: { email: emailUnico, password: passwordUnico }
    });
    const loginBody = await loginRes.json();
    token = loginBody.token;
  });

  // ==========================================
  // 1. OPERACIÓN: AGREGAR CONTACTO
  // ==========================================
  test('1. Agregar un contacto nuevo', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/contacts`, {
      headers: { 'Authorization': `Bearer ${token}` },
      data: {
        firstName: "John",
        lastName: "Doe",
        birthdate: "1970-01-01",
        email: "jdoe@fake.com",
        phone: "8005555555",
        street1: "1 Main St.",
        street2: "Apartment A",
        city: "Anytown",
        stateProvince: "KS",
        postalCode: "12345",
        country: "USA"
      }
    });

    expect(response.status()).toBe(201); // 201 = Creado exitosamente
    const responseBody = await response.json();
    
    // CAPTURA CLAVE: Guardamos el ID del contacto retornado por el servidor
    contactId = responseBody._id;
    expect(contactId).toBeDefined();

    console.log('--- CONTACTO CREADO ---');
    console.log('ID asignado por el servidor:', contactId);
  });

  // ==========================================
  // 2. OPERACIÓN: LISTAR TODOS LOS CONTACTOS
  // ==========================================
  test('2. Listar todos los contactos del usuario', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/contacts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);
    console.log(`--- LISTA RECOLECTADA --- Contactos encontrados: ${responseBody.length}`);
    console.table(responseBody, ['_id', 'firstName', 'lastName', 'email', 'phone']);
  });

  // ==========================================
  // 3. OPERACIÓN: OBTENER UN CONTACTO ESPECÍFICO
  // ==========================================
  test('3. Obtener los detalles de un contacto por su ID', async ({ request }) => {
    expect(contactId).not.toBe('');

    // Concatenamos el ID al final de la ruta
    const response = await request.get(`${BASE_URL}/contacts/${contactId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    
    expect(responseBody._id).toBe(contactId);
    expect(responseBody.firstName).toBe("John");
    console.log('--- DETALLE DE CONTACTO VALIDADO --- Nombre:', responseBody.firstName);
  });

  // ==========================================
  // 4. OPERACIÓN: ACTUALIZAR CONTACTO (PUT)
  // ==========================================
  test('4. Actualizar toda la información de un contacto (PUT)', async ({ request }) => {
    expect(contactId).not.toBe('');

    const response = await request.put(`${BASE_URL}/contacts/${contactId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      data: {
        firstName: "Amy",
        lastName: "Miller",
        birthdate: "1992-02-02",
        email: "amiller@fake.com",
        phone: "8005554242",
        street1: "13 School St.",
        street2: "Apt. 5",
        city: "Washington",
        stateProvince: "QC",
        postalCode: "A1A1A1",
        country: "Canada"
      }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    
    // Verificamos que los datos cambiaron al nuevo set de tu ejemplo (Amy Miller)
    expect(responseBody.firstName).toBe("Amy");
    expect(responseBody.lastName).toBe("Miller");
    console.log('--- CONTACTO ACTUALIZADO --- Nuevo Nombre:', responseBody.firstName);
  });

  // ==========================================
  // 5. NUEVA OPERACIÓN: ACTUALIZACIÓN PARCIAL (PATCH)
  // ==========================================
  test('5. Actualizar parcialmente el contacto (PATCH)', async ({ request }) => {
    expect(contactId).not.toBe('');

    // Corregimos el endpoint inyectando de forma dinámica el ${contactId}
    const response = await request.patch(`${BASE_URL}/contacts/${contactId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      data: {
        firstName: "Anna" // Solo modificamos el nombre de pila
      }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    
    // Asserts: Validamos que el nombre mutó a Anna, pero que conserve el apellido Miller del PUT previo
    expect(responseBody.firstName).toBe("Anna");
    expect(responseBody.lastName).toBe("Miller"); 
    console.log('--- PATCH COMPLETADO --- Nombre modificado a:', responseBody.firstName);
  });

  // 6. BORRAR CONTACTO
  test('6. Eliminar contacto permanentemente (DELETE)', async ({ request }) => {
    expect(contactId).not.toBe('');
    const response = await request.delete(`${BASE_URL}/contacts/${contactId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    expect(response.status()).toBe(200);
    const responseText = await response.text();
    expect(responseText).toBe("Contact deleted");
  });

  // 7. LOGOUT
  test('7. Cierre de sesión de control (LogOut)', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/users/logout`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(response.status()).toBe(200);
    console.log('--- MODULO CONTACTOS FINALIZADO LIMPIAMENTE ---');
  });
});