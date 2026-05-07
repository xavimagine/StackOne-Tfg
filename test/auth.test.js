import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// --- 1. MOCK DE SUPABASE ROBUSTO ---
// Definimos las funciones de encadenamiento una sola vez
const mockChain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    // Para el caso de .insert().select() que se comporta como promesa
    then: jest.fn(function (resolve) {
        return Promise.resolve(this).then(resolve);
    }),
};

const mockSupabase = {
    auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        admin: {
            listUsers: jest.fn(),
            deleteUser: jest.fn(),
        },
    },
    from: jest.fn().mockReturnValue(mockChain),
};

jest.unstable_mockModule("../db/database.js", () => ({
    supabase: mockSupabase,
}));

jest.unstable_mockModule("../dao/LogDAO.js", () => ({
    default: { insertar: jest.fn().mockResolvedValue(true) },
}));

// --- 2. IMPORTACIONES DINÁMICAS ---
const { default: authController } =
    await import("../controllers/authController.js");
const { default: LogDAO } = await import("../dao/LogDAO.js");

// --- 3. CONFIGURACIÓN APP ---
const app = express();
app.use(express.json());

// Bypass de sesión para controladores que leen req.usuario
app.use((req, res, next) => {
    req.usuario = { id: "user_123", nick: "testuser" };
    next();
});

app.post("/auth/registro", authController.registro);
app.post("/auth/login", authController.login);
app.post("/auth/logout", authController.logout);
app.delete("/auth/delete", authController.deleteAccount);

// --- 4. TESTS ---
describe("AuthController con JWT y Cookies", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Resetear el comportamiento de single por defecto
        mockChain.single.mockReset();
    });

    describe("POST /auth/registro", () => {
        test("Debería registrar con éxito (201)", async () => {
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: { id: "u1" } },
                error: null,
            });

            // Mock para .from().insert().select()
            mockChain.then.mockImplementationOnce(function (resolve) {
                return Promise.resolve({
                    data: [{ id: "user_123" }],
                    error: null,
                }).then(resolve);
            });

            const res = await request(app).post("/auth/registro").send({
                usuario: "testuser",
                email: "test@test.com",
                password: "password123",
            });

            expect(res.statusCode).toBe(201);
            expect(res.body.ok).toBe(true);
        });
    });

    describe("POST /auth/login", () => {
        test("Debería loguear y setear Cookie (200)", async () => {
            // Configuramos el resultado del encadenamiento para este test
            mockChain.single.mockResolvedValue({
                data: {
                    id: "user_123",
                    nick: "testuser",
                    email: "test@test.com",
                    avatar: "svg",
                },
                error: null,
            });

            mockSupabase.auth.signInWithPassword.mockResolvedValue({
                data: {},
                error: null,
            });

            const res = await request(app)
                .post("/auth/login")
                .send({ usuario: "testuser", password: "password123" });

            expect(res.statusCode).toBe(200);
            expect(res.headers["set-cookie"][0]).toContain("token=");
        });

        test("Debería dar 401 si el usuario no existe", async () => {
            mockChain.single.mockResolvedValue({
                data: null,
                error: { message: "No existe" },
            });

            const res = await request(app)
                .post("/auth/login")
                .send({ usuario: "fantasma", password: "123" });

            expect(res.statusCode).toBe(401);
        });
    });

    describe("DELETE /auth/delete", () => {
        test("Debería borrar cuenta (200)", async () => {
            // 1. Mock búsqueda previa (usando el mockChain)
            mockChain.single.mockResolvedValue({
                data: { email: "test@test.com" },
                error: null,
            });

            // 2. Mock borrado tabla (el .eq() devuelve el chain, resolvemos el chain como promesa)
            mockChain.then.mockImplementationOnce(function (resolve) {
                return Promise.resolve({ error: null }).then(resolve);
            });

            mockSupabase.auth.admin.listUsers.mockResolvedValue({
                data: { users: [{ id: "u1", email: "test@test.com" }] },
            });
            mockSupabase.auth.admin.deleteUser.mockResolvedValue({
                error: null,
            });

            const res = await request(app).delete("/auth/delete");

            expect(res.statusCode).toBe(200);
        });

        test("Debería dar 500 si falla el borrado", async () => {
            mockChain.single.mockResolvedValue({
                data: { email: "a@a.com" },
                error: null,
            });

            // Forzamos error en la respuesta de la cadena
            mockChain.then.mockImplementationOnce(function (resolve) {
                return Promise.resolve({ error: { message: "Error DB" } }).then(
                    resolve,
                );
            });

            const res = await request(app).delete("/auth/delete");

            expect(res.statusCode).toBe(500);
            expect(res.body.mensaje).toBe("Error DB");
        });
    });
});
