import { test, expect } from '@playwright/test';

const BASE_URL = 'https://thinking-tester-contact-list.herokuapp.com';

// "serial" obliga a que los tests se ejecuten estrictamente en orden: 1, luego 2...
test.describe.configure({ mode: 'serial' });

test.describe('Módulo de Autenticación y borrado de usuario', () => {
  let emailUnico;
  let emailActualizado;
  let passwordUnico = 'Password123!';
  let passwordActualizado = 'myNewPassword';
  let token = '';

  //beforeAll corre UNA Sola vez antes de TODOS los tests del bloque
  test.beforeAll(async () => {
    const randomId = Math.floor(Math.random() * 100000);
    emailUnico = `qa_test_${randomId}@fake.com`;
    emailActualizado = `qa_updated_${randomId}@fake.com`;
  });

  test('1. Crear usuario exitosamente', async ({ request }) => {
    console.log('--- INTENTANDO REGISTRAR ---');
    console.log('Correo generado para este test:', emailUnico);
    const response = await request.post(`${BASE_URL}/users`, {
      data: {
        firstName: "Test",
        lastName: "User",
        email: emailUnico,
        password: passwordUnico
      }
    });

    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.user).toHaveProperty('email', emailUnico);
  });

  test('2. Validar inicio de sesión (LogIn) exitoso', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/users/login`, {
      data: {
        email: emailUnico,
        password: passwordUnico
      }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    
    expect(responseBody).toHaveProperty('token');
    token = responseBody.token; 
    
    console.log('--- LOGIN EXITOSO ---');
    console.log('Token dinámico recibido:', token);
  });

  test('3. Obtener información del perfil (Me)', async ({ request }) => {
    // Nos aseguramos de que el token exista antes de continuar
    expect(token).not.toBe('');

    const response = await request.get(`${BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}` // Inyectamos el token dinámico aquí
      }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();

    // LOG RECOMENDADO 3: Ver los datos del perfil retornado
    console.log('--- PERFIL CONSULTADO CON ÉXITO ---');
    console.log('Nombre del perfil:', responseBody.firstName);
    console.log('Correo del perfil:', responseBody.email);

    // Validamos que el correo devuelto sea el mismo que creamos al inicio
    expect(responseBody.email).toBe(emailUnico);
    expect(responseBody).toHaveProperty('_id');
  });

  test('4. Actualizar datos del perfil (PATCH)', async ({ request }) => {
    expect(token).not.toBe('');

    const response = await request.patch(`${BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        firstName: "Updated",
        lastName: "Username",
        email: emailActualizado, // Usamos el correo dinámico nuevo
        password: passwordActualizado
      }
    });

    expect(response.status()).toBe(200); // El servidor responde 200 al actualizar con éxito
    const responseBody = await response.json();

    // LOG RECOMENDADO 4: Ver los nuevos datos reflejados
    console.log('--- PERFIL ACTUALIZADO CON ÉXITO ---');
    console.log('Nuevo Nombre:', responseBody.firstName);
    console.log('Nuevo Correo:', responseBody.email);

    // Asserts: Validamos que los cambios se hayan guardado de verdad
    expect(responseBody.firstName).toBe('Updated');
    expect(responseBody.lastName).toBe('Username');
    expect(responseBody.email).toBe(emailActualizado);
  });

  test('5. Eliminar perfil de usuario exitosamente (DELETE)', async ({ request }) => {
    expect(token).not.toBe('');

    const response = await request.delete(`${BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Validamos código 200 de éxito de eliminación
    expect(response.status()).toBe(200);

    console.log('--- ELIMINACIÓN EXITOSA ---');
    console.log('El usuario se eliminó de la base de datos por completo.');
  });
});